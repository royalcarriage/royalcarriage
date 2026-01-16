import os
import json
import tempfile
import unittest

import agents.yolo_agent as ya


class TestYoloAgent(unittest.TestCase):
    def setUp(self):
        # Use a temporary learning file
        self.tmpfd, self.tmpfile = tempfile.mkstemp(prefix="learning_", suffix=".json")
        os.close(self.tmpfd)
        ya.LEARNING_FILE = self.tmpfile

    def tearDown(self):
        try:
            os.remove(self.tmpfile)
        except Exception:
            pass

    def test_persist_learning_creates_file(self):
        prompt = "Test prompt"
        response = "Test response"
        ya.persist_learning(prompt, response)
        self.assertTrue(os.path.exists(self.tmpfile))
        with open(self.tmpfile, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        last = data[-1]
        self.assertEqual(last["prompt"], prompt)
        self.assertEqual(last["response"], response)

    def test_send_to_model_simulated_when_no_key(self):
        res = ya.send_to_model("claude-code", "hello world", api_key=None)
        self.assertIn("simulated response", res)


if __name__ == "__main__":
    unittest.main()
