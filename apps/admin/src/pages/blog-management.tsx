import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../state/AuthProvider";
import { canPerformAction } from "../lib/permissions";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  FileText,
  Globe,
  Search,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: string;
  authorEmail?: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt?: Timestamp;
  scheduledAt?: Timestamp;
  websiteId: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    canonical?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const BLOG_CATEGORIES = [
  { id: "company-news", label: "Company News" },
  { id: "travel-tips", label: "Travel Tips" },
  { id: "chicago-events", label: "Chicago Events" },
  { id: "wedding-planning", label: "Wedding Planning" },
  { id: "corporate-travel", label: "Corporate Travel" },
  { id: "luxury-lifestyle", label: "Luxury Lifestyle" },
  { id: "party-ideas", label: "Party Ideas" },
  { id: "airport-guides", label: "Airport Guides" },
];

const WEBSITES = [
  { id: "all", label: "All Websites" },
  { id: "chicagoairportblackcar", label: "Airport" },
  { id: "chicagoexecutivecarservice", label: "Corporate" },
  { id: "chicagoweddingtransportation", label: "Wedding" },
  { id: "chicago-partybus", label: "Party Bus" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Blog Post Editor Modal
function BlogEditorModal({
  isOpen,
  onClose,
  onSave,
  post,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BlogPost>) => void;
  post?: BlogPost;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "company-news",
    tags: [],
    status: "draft",
    websiteId: "chicagoairportblackcar",
    author: user?.displayName || user?.email || "Admin",
    authorEmail: user?.email || "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  });
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setFormData(post);
      setImagePreview(post.featuredImage || null);
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "company-news",
        tags: [],
        status: "draft",
        websiteId: "chicagoairportblackcar",
        author: user?.displayName || user?.email || "Admin",
        authorEmail: user?.email || "",
        seo: {
          metaTitle: "",
          metaDescription: "",
          keywords: [],
        },
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [post, isOpen, user]);

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: post ? formData.slug : generateSlug(title),
      seo: {
        ...formData.seo!,
        metaTitle: formData.seo?.metaTitle || title,
      },
    });
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleImageUpload(): Promise<string | null> {
    if (!imageFile) return formData.featuredImage || null;

    setUploadingImage(true);
    try {
      const slug = formData.slug || generateSlug(formData.title || "post");
      const storageRef = ref(
        storage,
        `blog-images/${slug}-${Date.now()}.${imageFile.name.split(".").pop()}`,
      );
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddTag() {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag("");
    }
  }

  function handleRemoveTag(tag: string) {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tag),
    });
  }

  function handleAddKeyword() {
    if (
      newKeyword.trim() &&
      !formData.seo?.keywords?.includes(newKeyword.trim())
    ) {
      setFormData({
        ...formData,
        seo: {
          ...formData.seo!,
          keywords: [...(formData.seo?.keywords || []), newKeyword.trim()],
        },
      });
      setNewKeyword("");
    }
  }

  function handleRemoveKeyword(keyword: string) {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo!,
        keywords: (formData.seo?.keywords || []).filter((k) => k !== keyword),
      },
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">
            {post ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "content"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Content
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "seo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            SEO Settings
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === "content" ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter blog post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>

              {/* Website and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website *
                  </label>
                  <select
                    value={formData.websiteId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {WEBSITES.filter((w) => w.id !== "all").map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition overflow-hidden border-2 border-dashed border-gray-300"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a featured image for this blog post. Recommended:
                      1200x630px
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </button>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setFormData({ ...formData, featuredImage: "" });
                          }}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief summary of the post (used in listings and previews)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt?.length || 0}/160 characters recommended
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Write your blog post content here. You can use HTML tags for formatting..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports HTML. {formData.content?.split(/\s+/).length || 0}{" "}
                  words
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and Author */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "draft"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as BlogPost["status"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* SEO Tab */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-900 mb-1">
                  Search Engine Optimization
                </h3>
                <p className="text-sm text-blue-700">
                  Optimize your blog post for search engines. These settings
                  affect how your post appears in search results.
                </p>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO title for search engines..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo?.metaTitle?.length || 0}/60 characters
                  (recommended)
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo?.metaDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: {
                        ...formData.seo!,
                        metaDescription: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description for search engine results..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo?.metaDescription?.length || 0}/160 characters
                  (recommended)
                </p>
              </div>

              {/* SEO Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddKeyword())
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a keyword..."
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.seo?.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canonical URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.seo?.canonical || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, canonical: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the default URL. Use only if this content
                  exists elsewhere.
                </p>
              </div>

              {/* Search Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Preview
                </label>
                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.seo?.metaTitle || formData.title || "Page Title"}
                  </div>
                  <div className="text-green-700 text-sm">
                    {formData.websiteId}.com/blog/{formData.slug || "url-slug"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.seo?.metaDescription ||
                      formData.excerpt ||
                      "Meta description will appear here..."}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              const imageUrl = await handleImageUpload();
              onSave({
                ...formData,
                featuredImage: imageUrl || formData.featuredImage,
                seo: {
                  ...formData.seo!,
                  ogImage:
                    imageUrl || formData.seo?.ogImage || formData.featuredImage,
                },
              });
            }}
            disabled={
              isLoading ||
              uploadingImage ||
              !formData.title ||
              !formData.content
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading || uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {uploadingImage
              ? "Uploading..."
              : post
                ? "Update Post"
                : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlogManagementPage() {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = canPerformAction(role, "editContent");
  const canDelete = canPerformAction(role, "deleteContent");

  // Real-time subscription to blog posts
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        setPosts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to blog posts:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Create or Update post
  async function handleSavePost(data: Partial<BlogPost>) {
    if (!canEdit) {
      alert("You do not have permission to edit blog posts");
      return;
    }

    setIsSaving(true);
    try {
      const now = Timestamp.now();

      if (editingPost) {
        // Update existing
        await updateDoc(doc(db, "blog_posts", editingPost.id), {
          ...data,
          updatedAt: now,
        });

        // Log activity
        await addDoc(collection(db, "activity_log"), {
          type: "content",
          message: `Updated blog post: ${data.title}`,
          status: "success",
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: now,
        });
      } else {
        // Create new
        const newPost = {
          ...data,
          createdAt: now,
          updatedAt: now,
          publishedAt: data.status === "published" ? now : null,
        };

        await addDoc(collection(db, "blog_posts"), newPost);

        // Log activity
        await addDoc(collection(db, "activity_log"), {
          type: "content",
          message: `Created blog post: ${data.title}`,
          status: "success",
          userId: user?.uid,
          userEmail: user?.email,
          timestamp: now,
        });
      }

      setIsModalOpen(false);
      setEditingPost(undefined);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Delete post
  async function handleDeletePost(post: BlogPost) {
    if (!canDelete) {
      alert("You do not have permission to delete blog posts");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(post.id);
    try {
      await deleteDoc(doc(db, "blog_posts", post.id));

      // Log activity
      await addDoc(collection(db, "activity_log"), {
        type: "content",
        message: `Deleted blog post: ${post.title}`,
        status: "success",
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  }

  // Toggle publish status
  async function handleTogglePublish(post: BlogPost) {
    if (!canEdit) return;

    const newStatus = post.status === "published" ? "draft" : "published";

    try {
      await updateDoc(doc(db, "blog_posts", post.id), {
        status: newStatus,
        publishedAt: newStatus === "published" ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  }

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (selectedWebsite !== "all" && post.websiteId !== selectedWebsite)
      return false;
    if (selectedStatus !== "all" && post.status !== selectedStatus)
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  };

  function getWebsiteLabel(websiteId: string) {
    return WEBSITES.find((w) => w.id === websiteId)?.label || websiteId;
  }

  function getCategoryLabel(categoryId: string) {
    return (
      BLOG_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Blog Editor Modal */}
      <BlogEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(undefined);
        }}
        onSave={handleSavePost}
        post={editingPost}
        isLoading={isSaving}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold">Blog & SEO Management</h1>
            {canEdit && (
              <button
                onClick={() => {
                  setEditingPost(undefined);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Blog Post
              </button>
            )}
          </div>
          <p className="text-gray-600">
            Create and manage blog posts for all your websites. Optimize SEO for
            better search rankings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-600">
              {stats.published}
            </div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.drafts}
            </div>
            <div className="text-gray-600">Drafts</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600">
              {stats.scheduled}
            </div>
            <div className="text-gray-600">Scheduled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Website Filter */}
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {WEBSITES.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No blog posts found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first blog post.
            </p>
            {canEdit && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Blog Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex">
                  {/* Featured Image */}
                  <div className="w-48 h-36 bg-gray-200 flex-shrink-0">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : post.status === "scheduled"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getWebsiteLabel(post.websiteId)}
                          </span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleTogglePublish(post)}
                              className={`p-2 rounded-lg transition ${
                                post.status === "published"
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                              title={
                                post.status === "published"
                                  ? "Unpublish"
                                  : "Publish"
                              }
                            >
                              {post.status === "published" ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeletePost(post)}
                            disabled={isDeleting === post.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                          "N/A"}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {post.tags.slice(0, 3).join(", ")}
                          {post.tags.length > 3 && ` +${post.tags.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
