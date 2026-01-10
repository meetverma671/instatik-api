// api/video.js

export default async function handler(req, res) {
  try {
    const inputUrl = req.query.url;

    if (!inputUrl) {
      return res.status(400).json({
        status: "error",
        message: "URL is required. Example: /api/video?url=https://instagram.com/reel/xxxx",
      });
    }

    // ✅ Make sure url is decoded properly
    const decodedUrl = decodeURIComponent(inputUrl);

    // ✅ Try primary provider first
    let result = await tryPrimaryProvider(decodedUrl);

    // ✅ If primary fails, try backup
    if (!result?.success) {
      result = await tryBackupProvider(decodedUrl);
    }

    // ✅ If both fail
    if (!result?.success) {
      return res.status(500).json({
        status: "error",
        input: decodedUrl,
        message: "All providers failed. Instagram may have updated protection.",
      });
    }

    return res.status(200).json({
      status: "success",
      input: decodedUrl,
      provider: result.provider,
      mp4: result.mp4,
      message: "MP4 link extracted ✅",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: err?.message || String(err),
    });
  }
}

/* ---------------------------------------
   ✅ Provider #1 (Primary)
   Example: RapidAPI Instagram Downloader
---------------------------------------- */

async function tryPrimaryProvider(url) {
  try {
    // ✅ Replace with your Provider API endpoint
    const API_URL = "https://YOUR_PRIMARY_PROVIDER_ENDPOINT";

    // ✅ Example request body
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // ✅ Put your API key in Vercel ENV
        "X-RapidAPI-Key": process.env.PRIMARY_API_KEY,
        "X-RapidAPI-Host": process.env.PRIMARY_API_HOST,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return { success: false, provider: "primary", error: "Primary API failed" };
    }

    const data = await response.json();

    // ✅ IMPORTANT:
    // Provider response format differs.
    // You must map mp4 url from provider response.
    // Example:
    const mp4 = data?.mp4 || data?.download_url || data?.result?.mp4;

    if (!mp4) {
      return { success: false, provider: "primary", error: "No MP4 found" };
    }

    return { success: true, provider: "primary", mp4 };
  } catch (e) {
    return { success: false, provider: "primary", error: e?.message };
  }
}

/* ---------------------------------------
   ✅ Provider #2 (Backup)
   Example: another RapidAPI / alternate service
---------------------------------------- */

async function tryBackupProvider(url) {
  try {
    const API_URL = "https://YOUR_BACKUP_PROVIDER_ENDPOINT";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // ✅ Put your backup API key in Vercel ENV
        "X-RapidAPI-Key": process.env.BACKUP_API_KEY,
        "X-RapidAPI-Host": process.env.BACKUP_API_HOST,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return { success: false, provider: "backup", error: "Backup API failed" };
    }

    const data = await response.json();

    const mp4 = data?.mp4 || data?.download_url || data?.result?.mp4;

    if (!mp4) {
      return { success: false, provider: "backup", error: "No MP4 found" };
    }

    return { success: true, provider: "backup", mp4 };
  } catch (e) {
    return { success: false, provider: "backup", error: e?.message };
  }
}
