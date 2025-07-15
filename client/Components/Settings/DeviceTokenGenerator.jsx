import React, { useState, useEffect } from 'react';

function DeviceTokenGenerator() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports service workers and notifications
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setSupported(true);
    } else {
      setError('Your browser does not support push notifications');
    }
  }, []);

  const generateToken = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setError('Notification permission denied. Please allow notifications and try again.');
        setLoading(false);
        return;
      }

      // Generate a more realistic FCM token format
      // Note: This is still a mock token for demonstration
      const mockToken = generateRealisticMockToken();
      setToken(mockToken);
      
    } catch (err) {
      setError('Error generating token: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRealisticMockToken = () => {
    // Generate a more realistic FCM token format
    // Real FCM tokens are typically 163 characters and contain specific patterns
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const segments = [];
    
    // FCM tokens typically have multiple segments separated by colons
    for (let i = 0; i < 4; i++) {
      let segment = '';
      const length = i === 0 ? 40 : (i === 3 ? 43 : 40);
      for (let j = 0; j < length; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    
    return segments.join(':');
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied to clipboard!');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        🔑 Device Token Generator
      </h3>
      
      <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ <strong>Note:</strong> This generates mock tokens for demonstration. 
          For real testing, you need actual FCM tokens from Firebase SDK.
        </p>
      </div>
      
      {!supported && (
        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {supported && (
        <>
          <p className="text-gray-700 mb-4">
            Generate a mock device token to test the interface (won't send real notifications):
          </p>
          
          <button
            onClick={generateToken}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
          >
            {loading ? '⏳ Generating...' : '🎯 Generate Mock Token'}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
              <p className="text-red-700">❌ {error}</p>
            </div>
          )}

          {token && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Mock Token Generated:</h4>
              <p className="text-sm text-orange-600 mb-2">
                ⚠️ This is a demo token - Firebase will reject it. Use for interface testing only.
              </p>
              <div className="bg-white border rounded p-3 mb-3">
                <code className="text-sm text-gray-800 break-all">{token}</code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToken}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  📋 Copy Token
                </button>
                <button
                  onClick={() => setToken('')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  🔄 Generate New
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DeviceTokenGenerator; 