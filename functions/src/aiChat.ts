/**
 * AI Chat Cloud Functions with Role-Based Permission Guard Rails
 *
 * This module provides secure AI chat functionality with:
 * - Role-based access control and filtering
 * - Sensitive data redaction for lower-privilege roles
 * - Permission-aware system prompts
 * - Comprehensive audit logging
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  Role,
  Roles,
  Permission,
  Permissions,
  User,
  RolePermissions,
  getPermissionsForRole,
  RoleHierarchy,
} from "./rbac/permissions";
import {
  verifyAuthAndGetUser,
  hasPermission,
  canAccessOrganization,
  PermissionDeniedError,
  AuthenticationError,
} from "./rbac/guards";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// Types and Interfaces
// ============================================

interface AIChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
  context?: {
    dataQuery?: string;
    commandType?: string;
    targetCollection?: string;
    targetOrganizationId?: string;
  };
}

interface AIChatResponse {
  response: string;
  tokens: number;
  conversationId: string;
  model: string;
  permissions: string[];
  dataRedacted: boolean;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: admin.firestore.Timestamp;
  model?: string;
  tokens?: number;
  userId?: string;
  userRole?: Role;
  redacted?: boolean;
}

interface ChatHistoryRequest {
  limit?: number;
  conversationId?: string;
  includeSystemMessages?: boolean;
}

interface ExecuteCommandRequest {
  command: string;
  parameters?: Record<string, unknown>;
  targetOrganizationId?: string;
}

interface ExecuteCommandResponse {
  success: boolean;
  result?: unknown;
  redactedFields?: string[];
  error?: string;
  auditLogId: string;
}

// Sensitive field definitions by collection
const SENSITIVE_FIELDS: Record<string, string[]> = {
  users: ["password", "passwordHash", "apiKey", "secretKey", "ssn", "taxId"],
  organizations: ["apiKey", "secretKey", "stripeKey", "webhookSecret"],
  bookings: ["creditCard", "cvv", "cardNumber", "paymentToken"],
  drivers: ["ssn", "licenseNumber", "bankAccount", "routingNumber"],
  accounting: ["accountNumber", "taxId", "bankDetails"],
};

// Data access levels by role
const ROLE_DATA_ACCESS: Record<Role, string[]> = {
  dispatcher: ["vehicles", "drivers", "bookings_basic", "assignments"],
  accountant: ["accounting", "receipts", "refunds", "drivers_basic"],
  fleet_manager: [
    "vehicles",
    "drivers",
    "assignments",
    "vehicle_issues",
    "fleet",
  ],
  admin: [
    "users",
    "vehicles",
    "drivers",
    "bookings",
    "accounting",
    "receipts",
    "refunds",
    "assignments",
    "vehicle_issues",
    "fleet",
    "organization",
  ],
  saas_admin: ["*"], // Full access
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate role-aware system prompt
 */
function generateSystemPrompt(user: User): string {
  const permissions = getPermissionsForRole(user.role);
  const dataAccess = ROLE_DATA_ACCESS[user.role];

  const roleDescriptions: Record<Role, string> = {
    dispatcher: "a dispatcher who manages vehicle assignments and scheduling",
    accountant: "an accountant who handles financial records and receipts",
    fleet_manager:
      "a fleet manager who oversees vehicles, drivers, and maintenance",
    admin:
      "an organization administrator with full access to organization data",
    saas_admin: "a SaaS platform administrator with full system access",
  };

  const roleDescription = roleDescriptions[user.role] || "a platform user";

  const prompt = `You are an AI assistant for Royal Carriage Limousine, a luxury transportation company.
You are currently assisting ${user.displayName || user.email}, who is ${roleDescription}.

User Details:
- Role: ${user.role}
- Organization: ${user.organizationId}
- Email: ${user.email}

The user has the following permissions:
${permissions.map((p) => `- ${p}`).join("\n")}

Data Access:
${dataAccess.includes("*") ? "- Full access to all data" : dataAccess.map((d) => `- ${d}`).join("\n")}

IMPORTANT RESTRICTIONS:
1. Only provide information the user is authorized to access based on their role.
2. Never expose sensitive data like passwords, SSN, credit card numbers, or API keys.
3. For data queries, only return results the user has permission to view.
4. If the user asks for information outside their access level, politely explain they don't have permission.
5. Always respect organization boundaries - users can only see their own organization's data unless they are a saas_admin.

You can help with:
- Content generation for websites (SEO-optimized)
- Data analysis and reporting (within permission scope)
- Answering questions about the platform
- Generating reports the user has access to
- Providing insights on fleet, bookings, or accounting (based on role)

Be helpful, professional, and always respect the permission boundaries.`;

  return prompt;
}

/**
 * Redact sensitive fields from data based on user role
 */
function redactSensitiveData(
  data: Record<string, unknown>,
  collection: string,
  userRole: Role,
): { data: Record<string, unknown>; redactedFields: string[] } {
  const redactedFields: string[] = [];

  // SaaS admin sees everything
  if (userRole === "saas_admin") {
    return { data, redactedFields: [] };
  }

  // Admin can see most things except the most sensitive
  const fieldsToRedact = SENSITIVE_FIELDS[collection] || [];

  const redactedData = { ...data };

  for (const field of fieldsToRedact) {
    if (field in redactedData) {
      redactedData[field] = "[REDACTED]";
      redactedFields.push(field);
    }

    // Handle nested objects
    for (const key of Object.keys(redactedData)) {
      if (typeof redactedData[key] === "object" && redactedData[key] !== null) {
        const nested = redactedData[key] as Record<string, unknown>;
        if (field in nested) {
          nested[field] = "[REDACTED]";
          redactedFields.push(`${key}.${field}`);
        }
      }
    }
  }

  return { data: redactedData, redactedFields };
}

/**
 * Check if user can access a specific data collection
 */
function canAccessCollection(user: User, collection: string): boolean {
  const accessibleCollections = ROLE_DATA_ACCESS[user.role];

  if (accessibleCollections.includes("*")) {
    return true;
  }

  return accessibleCollections.some(
    (c) => c === collection || collection.startsWith(c.replace("_basic", "")),
  );
}

/**
 * Log AI interaction for audit
 */
async function logAIInteraction(
  userId: string,
  userRole: Role,
  organizationId: string,
  action: string,
  details: Record<string, unknown>,
  status: "success" | "denied" | "error",
): Promise<string> {
  const logRef = await db.collection("ai_audit_log").add({
    userId,
    userRole,
    organizationId,
    action,
    details,
    status,
    timestamp: admin.firestore.Timestamp.now(),
    ipAddress: "server-side",
  });

  return logRef.id;
}

/**
 * Generate AI response using Gemini
 */
async function generateAIResponse(
  message: string,
  systemPrompt: string,
  history: ChatMessage[],
  model: string,
): Promise<{ response: string; tokens: number }> {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const apiKey =
      process.env.GEMINI_API_KEY || functions.config().gemini?.api_key;
    if (!apiKey) {
      return generateLocalResponse(message, systemPrompt);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Build conversation context
    const contextMessages = history.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start chat with system prompt and history
    const chat = geminiModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I'm ready to assist while respecting the user's role and permissions.",
            },
          ],
        },
        ...contextMessages,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    const tokens = Math.ceil(response.length / 4);

    return { response, tokens };
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    return generateLocalResponse(message, systemPrompt);
  }
}

/**
 * Local fallback response
 */
function generateLocalResponse(
  message: string,
  _systemPrompt: string,
): { response: string; tokens: number } {
  const lowerMessage = message.toLowerCase();

  let response = "";

  if (lowerMessage.includes("permission") || lowerMessage.includes("access")) {
    response = `Your current role determines what data and features you can access.

If you need access to additional features, please contact your organization administrator.

I can help you with tasks within your current permission scope. What would you like to do?`;
  } else if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("what can you do")
  ) {
    response = `I'm your AI assistant for Royal Carriage. Based on your role, I can help you with:

- Answering questions about the platform
- Generating content and reports you're authorized to access
- Analyzing data within your permission scope
- Providing guidance on using available features

What would you like help with?`;
  } else if (lowerMessage.includes("data") || lowerMessage.includes("report")) {
    response = `I can help you with data and reports within your access level.

Please specify:
1. What type of data or report you need
2. The time period (if applicable)
3. Any specific filters or criteria

Note: Results will be filtered based on your role permissions.`;
  } else {
    response = `I received your message. I'm here to help you with tasks within your permission scope.

Please let me know what you'd like to accomplish, and I'll assist while respecting the access controls for your role.`;
  }

  return { response, tokens: Math.ceil(response.length / 4) };
}

// ============================================
// Cloud Functions
// ============================================

/**
 * Process AI chat message with role-based filtering
 */
export const processAIChatMessage = functions.https.onCall(
  async (data: AIChatRequest, context): Promise<AIChatResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    let user: User;
    try {
      user = await verifyAuthAndGetUser(`Bearer ${context.auth.token}`);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication failed",
      );
    }

    // Check AI chat access permission
    if (!hasPermission(user, Permissions.AI_CHAT_ACCESS)) {
      await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "chat_message",
        { message: data.message.substring(0, 100) },
        "denied",
      );

      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to use AI chat",
      );
    }

    const {
      message,
      conversationId,
      model = "gemini-pro",
      context: msgContext,
    } = data;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Message is required",
      );
    }

    let activeConversationId = conversationId;
    let conversationHistory: ChatMessage[] = [];
    let dataRedacted = false;

    try {
      // Load or create conversation
      if (conversationId) {
        const convDoc = await db
          .collection("ai_conversations")
          .doc(conversationId)
          .get();
        if (convDoc.exists && convDoc.data()?.userId === user.uid) {
          const messagesSnap = await db
            .collection("ai_conversations")
            .doc(conversationId)
            .collection("messages")
            .orderBy("timestamp", "desc")
            .limit(10)
            .get();

          conversationHistory = messagesSnap.docs
            .map((doc) => doc.data() as ChatMessage)
            .reverse();
        }
      }

      // Create new conversation if needed
      if (!activeConversationId) {
        const newConv = await db.collection("ai_conversations").add({
          userId: user.uid,
          userEmail: user.email,
          userRole: user.role,
          organizationId: user.organizationId,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          lastMessage: message.substring(0, 100),
          messageCount: 0,
          timestamp: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
        });
        activeConversationId = newConv.id;
      }

      // Check if message contains data request
      if (
        msgContext?.targetCollection &&
        !canAccessCollection(user, msgContext.targetCollection)
      ) {
        const deniedResponse = `I apologize, but you don't have permission to access data in the "${msgContext.targetCollection}" collection. Your role (${user.role}) has access to: ${ROLE_DATA_ACCESS[user.role].join(", ")}.`;

        // Save denied response
        await db
          .collection("ai_conversations")
          .doc(activeConversationId)
          .collection("messages")
          .add({
            role: "user",
            content: message,
            timestamp: admin.firestore.Timestamp.now(),
            userId: user.uid,
            userRole: user.role,
          });

        await db
          .collection("ai_conversations")
          .doc(activeConversationId)
          .collection("messages")
          .add({
            role: "assistant",
            content: deniedResponse,
            timestamp: admin.firestore.Timestamp.now(),
            model: "permission-check",
          });

        await logAIInteraction(
          user.uid,
          user.role,
          user.organizationId,
          "chat_data_access_denied",
          {
            collection: msgContext.targetCollection,
            message: message.substring(0, 100),
          },
          "denied",
        );

        return {
          response: deniedResponse,
          tokens: 0,
          conversationId: activeConversationId,
          model: "permission-check",
          permissions: getPermissionsForRole(user.role),
          dataRedacted: false,
        };
      }

      // Generate role-aware system prompt
      const systemPrompt = generateSystemPrompt(user);

      // Generate AI response
      const { response, tokens } = await generateAIResponse(
        message,
        systemPrompt,
        conversationHistory,
        model,
      );

      // Check if response contains potential sensitive data and redact
      const sensitivePatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /\b\d{16}\b/, // Credit card
        /password\s*[:=]\s*\S+/i, // Password
        /api[_-]?key\s*[:=]\s*\S+/i, // API key
      ];

      let finalResponse = response;
      for (const pattern of sensitivePatterns) {
        if (pattern.test(finalResponse)) {
          finalResponse = finalResponse.replace(pattern, "[REDACTED]");
          dataRedacted = true;
        }
      }

      // Save user message
      await db
        .collection("ai_conversations")
        .doc(activeConversationId)
        .collection("messages")
        .add({
          role: "user",
          content: message,
          timestamp: admin.firestore.Timestamp.now(),
          userId: user.uid,
          userRole: user.role,
        });

      // Save AI response
      await db
        .collection("ai_conversations")
        .doc(activeConversationId)
        .collection("messages")
        .add({
          role: "assistant",
          content: finalResponse,
          timestamp: admin.firestore.Timestamp.now(),
          model,
          tokens,
          redacted: dataRedacted,
        });

      // Update conversation metadata
      await db
        .collection("ai_conversations")
        .doc(activeConversationId)
        .update({
          lastMessage: finalResponse.substring(0, 100),
          messageCount: admin.firestore.FieldValue.increment(2),
          timestamp: admin.firestore.Timestamp.now(),
        });

      // Log successful interaction
      await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "chat_message",
        {
          conversationId: activeConversationId,
          tokens,
          model,
          redacted: dataRedacted,
        },
        "success",
      );

      return {
        response: finalResponse,
        tokens,
        conversationId: activeConversationId,
        model,
        permissions: getPermissionsForRole(user.role),
        dataRedacted,
      };
    } catch (error: unknown) {
      console.error("AI Chat error:", error);

      await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "chat_message",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          message: message.substring(0, 100),
        },
        "error",
      );

      throw new functions.https.HttpsError(
        "internal",
        `Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
);

/**
 * Get AI chat history filtered by user permissions
 */
export const getAIChatHistory = functions.https.onCall(
  async (
    data: ChatHistoryRequest,
    context,
  ): Promise<{
    conversations: unknown[];
    messages?: unknown[];
  }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    let user: User;
    try {
      user = await verifyAuthAndGetUser(`Bearer ${context.auth.token}`);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication failed",
      );
    }

    if (!hasPermission(user, Permissions.AI_CHAT_ACCESS)) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to access AI chat history",
      );
    }

    const {
      limit: queryLimit = 20,
      conversationId,
      includeSystemMessages = false,
    } = data;

    try {
      // If specific conversation requested
      if (conversationId) {
        const convDoc = await db
          .collection("ai_conversations")
          .doc(conversationId)
          .get();

        if (!convDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "Conversation not found",
          );
        }

        const convData = convDoc.data();

        // Check ownership or saas_admin access
        if (convData?.userId !== user.uid && user.role !== "saas_admin") {
          throw new functions.https.HttpsError(
            "permission-denied",
            "Cannot access this conversation",
          );
        }

        // Check organization access for saas_admin viewing other users
        if (
          convData?.userId !== user.uid &&
          !canAccessOrganization(user, convData?.organizationId)
        ) {
          throw new functions.https.HttpsError(
            "permission-denied",
            "Cannot access conversations from other organizations",
          );
        }

        // Get messages
        let messagesQuery = db
          .collection("ai_conversations")
          .doc(conversationId)
          .collection("messages")
          .orderBy("timestamp", "asc");

        if (!includeSystemMessages) {
          messagesQuery = messagesQuery.where("role", "!=", "system");
        }

        const messagesSnap = await messagesQuery.get();
        const messages = messagesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
        }));

        return {
          conversations: [
            {
              id: convDoc.id,
              ...convData,
              timestamp: convData?.timestamp?.toDate?.()?.toISOString(),
              createdAt: convData?.createdAt?.toDate?.()?.toISOString(),
            },
          ],
          messages,
        };
      }

      // Get all conversations for user
      let conversationsQuery: FirebaseFirestore.Query =
        db.collection("ai_conversations");

      // SaaS admin can see all conversations in all organizations
      // Admin can see all conversations in their organization
      // Other roles can only see their own conversations
      if (user.role === "saas_admin") {
        conversationsQuery = conversationsQuery.orderBy("timestamp", "desc");
      } else if (user.role === "admin") {
        conversationsQuery = conversationsQuery
          .where("organizationId", "==", user.organizationId)
          .orderBy("timestamp", "desc");
      } else {
        conversationsQuery = conversationsQuery
          .where("userId", "==", user.uid)
          .orderBy("timestamp", "desc");
      }

      conversationsQuery = conversationsQuery.limit(Math.min(queryLimit, 50));

      const conversationsSnap = await conversationsQuery.get();
      const conversations = conversationsSnap.docs.map((doc) => {
        const convData = doc.data();
        return {
          id: doc.id,
          ...convData,
          timestamp: convData?.timestamp?.toDate?.()?.toISOString(),
          createdAt: convData?.createdAt?.toDate?.()?.toISOString(),
        };
      });

      await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "get_chat_history",
        { count: conversations.length },
        "success",
      );

      return { conversations };
    } catch (error: unknown) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      console.error("Get AI chat history error:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to get chat history: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
);

/**
 * Execute AI command with permission checks
 */
export const executeAICommand = functions.https.onCall(
  async (
    data: ExecuteCommandRequest,
    context,
  ): Promise<ExecuteCommandResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    let user: User;
    try {
      user = await verifyAuthAndGetUser(`Bearer ${context.auth.token}`);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication failed",
      );
    }

    // Check AI chat access
    if (!hasPermission(user, Permissions.AI_CHAT_ACCESS)) {
      const auditLogId = await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "execute_command",
        { command: data.command },
        "denied",
      );

      return {
        success: false,
        error: "You do not have permission to execute AI commands",
        auditLogId,
      };
    }

    const { command, parameters = {}, targetOrganizationId } = data;

    // Check organization access if specified
    if (
      targetOrganizationId &&
      !canAccessOrganization(user, targetOrganizationId)
    ) {
      const auditLogId = await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "execute_command",
        { command, targetOrganization: targetOrganizationId },
        "denied",
      );

      return {
        success: false,
        error: "You do not have permission to access this organization",
        auditLogId,
      };
    }

    try {
      let result: unknown;
      const redactedFields: string[] = [];

      // Command router with permission checks
      switch (command) {
        case "view_users": {
          if (!hasPermission(user, Permissions.USERS_VIEW)) {
            const auditLogId = await logAIInteraction(
              user.uid,
              user.role,
              user.organizationId,
              "execute_command",
              { command },
              "denied",
            );
            return {
              success: false,
              error: "Permission denied: Cannot view users",
              auditLogId,
            };
          }

          const orgId = targetOrganizationId || user.organizationId;
          const usersSnap = await db
            .collection("users")
            .where("organizationId", "==", orgId)
            .where("isActive", "==", true)
            .get();

          const users = usersSnap.docs.map((doc) => {
            const userData = doc.data();
            const { data: redacted, redactedFields: fields } =
              redactSensitiveData(userData, "users", user.role);
            if (fields.length > 0) redactedFields.push(...fields);
            return { id: doc.id, ...redacted };
          });

          result = users;
          break;
        }

        case "view_vehicles": {
          if (!hasPermission(user, Permissions.VEHICLES_VIEW)) {
            const auditLogId = await logAIInteraction(
              user.uid,
              user.role,
              user.organizationId,
              "execute_command",
              { command },
              "denied",
            );
            return {
              success: false,
              error: "Permission denied: Cannot view vehicles",
              auditLogId,
            };
          }

          const vehiclesSnap = await db.collection("vehicles").get();
          result = vehiclesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          break;
        }

        case "view_accounting": {
          if (!hasPermission(user, Permissions.ACCOUNTING_VIEW)) {
            const auditLogId = await logAIInteraction(
              user.uid,
              user.role,
              user.organizationId,
              "execute_command",
              { command },
              "denied",
            );
            return {
              success: false,
              error: "Permission denied: Cannot view accounting data",
              auditLogId,
            };
          }

          const startDate = parameters.startDate as string;
          const endDate = parameters.endDate as string;

          let accountingQuery: FirebaseFirestore.Query =
            db.collection("accounting");

          if (startDate) {
            accountingQuery = accountingQuery.where("date", ">=", startDate);
          }
          if (endDate) {
            accountingQuery = accountingQuery.where("date", "<=", endDate);
          }

          const accountingSnap = await accountingQuery.limit(100).get();
          const accountingData = accountingSnap.docs.map((doc) => {
            const data = doc.data();
            const { data: redacted, redactedFields: fields } =
              redactSensitiveData(data, "accounting", user.role);
            if (fields.length > 0) redactedFields.push(...fields);
            return { id: doc.id, ...redacted };
          });

          result = accountingData;
          break;
        }

        case "run_report": {
          const reportType = parameters.type as string;

          // Check report-specific permissions
          const reportPermissions: Record<string, Permission> = {
            seo: Permissions.ACCOUNTING_VIEW,
            vehicles: Permissions.VEHICLES_VIEW,
            drivers: Permissions.DRIVERS_VIEW,
            accounting: Permissions.ACCOUNTING_VIEW,
          };

          const requiredPermission = reportPermissions[reportType];
          if (requiredPermission && !hasPermission(user, requiredPermission)) {
            const auditLogId = await logAIInteraction(
              user.uid,
              user.role,
              user.organizationId,
              "execute_command",
              { command, reportType },
              "denied",
            );
            return {
              success: false,
              error: `Permission denied: Cannot run ${reportType} report`,
              auditLogId,
            };
          }

          // Generate report based on type
          result = {
            reportType,
            generatedAt: new Date().toISOString(),
            generatedBy: user.email,
            message: `Report type "${reportType}" generated successfully`,
            // In a real implementation, this would contain actual report data
          };
          break;
        }

        case "view_organizations": {
          if (!hasPermission(user, Permissions.SAAS_VIEW_ALL_ORGANIZATIONS)) {
            const auditLogId = await logAIInteraction(
              user.uid,
              user.role,
              user.organizationId,
              "execute_command",
              { command },
              "denied",
            );
            return {
              success: false,
              error:
                "Permission denied: Only SaaS administrators can view all organizations",
              auditLogId,
            };
          }

          const orgsSnap = await db
            .collection("organizations")
            .where("isActive", "==", true)
            .get();

          const orgs = orgsSnap.docs.map((doc) => {
            const orgData = doc.data();
            const { data: redacted, redactedFields: fields } =
              redactSensitiveData(orgData, "organizations", user.role);
            if (fields.length > 0) redactedFields.push(...fields);
            return { id: doc.id, ...redacted };
          });

          result = orgs;
          break;
        }

        default:
          const auditLogId = await logAIInteraction(
            user.uid,
            user.role,
            user.organizationId,
            "execute_command",
            { command },
            "error",
          );
          return {
            success: false,
            error: `Unknown command: ${command}`,
            auditLogId,
          };
      }

      const auditLogId = await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "execute_command",
        { command, redactedFields: redactedFields.length },
        "success",
      );

      return {
        success: true,
        result,
        redactedFields: redactedFields.length > 0 ? redactedFields : undefined,
        auditLogId,
      };
    } catch (error: unknown) {
      console.error("Execute AI command error:", error);

      const auditLogId = await logAIInteraction(
        user.uid,
        user.role,
        user.organizationId,
        "execute_command",
        {
          command,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "error",
      );

      return {
        success: false,
        error: `Command failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        auditLogId,
      };
    }
  },
);

/**
 * Delete an AI conversation
 */
export const deleteAIConversation = functions.https.onCall(
  async (
    data: { conversationId: string },
    context,
  ): Promise<{ success: boolean }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    let user: User;
    try {
      user = await verifyAuthAndGetUser(`Bearer ${context.auth.token}`);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new functions.https.HttpsError("unauthenticated", error.message);
      }
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication failed",
      );
    }

    const { conversationId } = data;

    // Verify ownership
    const convDoc = await db
      .collection("ai_conversations")
      .doc(conversationId)
      .get();

    if (!convDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Conversation not found",
      );
    }

    const convData = convDoc.data();

    // Check ownership - only owner or saas_admin can delete
    if (convData?.userId !== user.uid && user.role !== "saas_admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Cannot delete this conversation",
      );
    }

    // Delete messages subcollection
    const messagesSnap = await db
      .collection("ai_conversations")
      .doc(conversationId)
      .collection("messages")
      .get();

    const batch = db.batch();
    messagesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(db.collection("ai_conversations").doc(conversationId));

    await batch.commit();

    await logAIInteraction(
      user.uid,
      user.role,
      user.organizationId,
      "delete_conversation",
      { conversationId },
      "success",
    );

    return { success: true };
  },
);
