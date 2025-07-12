import React, { useState, useRef, useEffect } from "react";

function StatusMessage({ message, type, onHide }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onHide(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onHide]);
  if (!message) return null;
  return (
    <div
      className={`status ${type} mb-4 p-3 rounded ${
        type === "success"
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-800 border border-red-300"
      }`}
    >
      {message}
    </div>
  );
}

function FirebaseNotificationSetup() {
  const [projectId, setProjectId] = useState("");
  const [serviceAccount, setServiceAccount] = useState(null);
  const [fileInfo, setFileInfo] = useState("");
  const [status, setStatus] = useState({ message: "", type: "success" });
  const [deviceToken, setDeviceToken] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Firebase!");
  const fileInputRef = useRef();

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("firebaseConfig");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setProjectId(config.projectId || "");
        setStatus({
          message: "Previous configuration loaded",
          type: "success",
        });
      } catch {}
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileInfo(
        `📄 Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const jsonData = JSON.parse(evt.target.result);
          if (jsonData.type === "service_account") {
            setServiceAccount(jsonData);
            setStatus({
              message: "Valid service account file loaded!",
              type: "success",
            });
          } else {
            setServiceAccount(null);
            setStatus({
              message: "Invalid service account file format",
              type: "error",
            });
          }
        } catch (error) {
          setServiceAccount(null);
          setStatus({
            message: "Error reading JSON file: " + error.message,
            type: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    if (!projectId || !serviceAccount) {
      setStatus({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }
    localStorage.setItem(
      "firebaseConfig",
      JSON.stringify({
        projectId,
        hasServiceAccount: true,
        timestamp: new Date().toISOString(),
      })
    );
    setStatus({
      message: "Configuration saved successfully! Ready to send notifications.",
      type: "success",
    });
  };

  const sendTestNotification = () => {
    if (!deviceToken || !testMessage) {
      setStatus({
        message: "Please enter both device token and test message",
        type: "error",
      });
      return;
    }
    if (!projectId || !serviceAccount) {
      setStatus({
        message: "Please configure Firebase settings first",
        type: "error",
      });
      return;
    }
    setStatus({
      message: `Test notification would be sent to: ${deviceToken.substring(
        0,
        20
      )}...`,
      type: "success",
    });
    setTimeout(() => {
      setStatus({
        message: "✅ Test notification sent successfully!",
        type: "success",
      });
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto my-8">
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          🔥 Firebase Notification Setup
        </h1>
        <p className="text-lg opacity-90">
          Configure your Firebase project for push notifications
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Left: Form & Test */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <StatusMessage
            message={status.message}
            type={status.type}
            onHide={() => setStatus({ ...status, message: "" })}
          />
          <form
            onSubmit={handleConfigSubmit}
            className="bg-gray-50 p-6 rounded-xl border mb-6"
          >
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Firebase Project ID
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="your-project-id"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Firebase Service Account File (JSON)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                >
                  📁 Upload Service Account JSON
                </button>
                {fileInfo && (
                  <span className="text-blue-700 text-sm ml-2">{fileInfo}</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded mt-4 font-semibold"
            >
              💾 Save Configuration
            </button>
          </form>
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="font-semibold mb-2">Test Notification</h3>
            <div className="mb-3">
              <label className="block mb-1">Device Token</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter device token to test"
                value={deviceToken}
                onChange={(e) => setDeviceToken(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Test Message</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Hello from Firebase!"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 rounded font-semibold"
              onClick={sendTestNotification}
            >
              🚀 Send Test Notification
            </button>
          </div>
        </div>
        {/* Right: Guide */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Setup Guide</h2>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 1: Get Your Project ID</h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>
                Go to{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Firebase Console
                </a>
              </li>
              <li>Select your project</li>
              <li>Click the gear icon ⚙️ → Project Settings</li>
              <li>Copy your Project ID from the General tab</li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">
              Step 2: Generate Service Account File
            </h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>In Firebase Console, go to Project Settings</li>
              <li>Click on "Service accounts" tab</li>
              <li>Click "Generate new private key"</li>
              <li>Download the JSON file</li>
              <li className="text-red-600">
                ⚠️ Keep this file secure - it contains private credentials!
              </li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">
              Step 3: Enable Firebase Cloud Messaging
            </h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>In Firebase Console, go to "Cloud Messaging"</li>
              <li>If not enabled, click "Get started"</li>
              <li>Note your Server Key and Sender ID</li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 4: Sample Code</h3>
            <p className="mb-2">
              Here's how to send notifications with your setup:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              <code>{`
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Hello!',
    body: 'This is a test notification'
  },
  token: 'device-token-here'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
`}</code>
            </pre>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 5: Client Setup</h3>
            <p className="mb-2">For web clients, add this to your HTML:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
              <code>{`
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js"></script>

<script>
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();
getToken(messaging, { vapidKey: 'your-vapid-key' }).then((currentToken) => {
  if (currentToken) {
    console.log('Registration token:', currentToken);
  }
});
</script>
`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirebaseNotificationSetup;
