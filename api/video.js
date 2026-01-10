export default async function handler(req, res) {
  try {
    const url = req.query.url || "";

    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "Missing url parameter"
      });
    }

    // ✅ DEMO MODE:
    // If user pastes a direct mp4 link, return it as downloadUrl.
    // This is legal + stable.
    const lower = url.toLowerCase();
    const isMp4 = lower.endsWith(".mp4") || lower.includes(".mp4?");

    if (isMp4) {
      return res.status(200).json({
        status: "success",
        title: "Video",
        downloadUrl: url
      });
    }

    // ✅ For Instagram/TikTok links:
    // We are not extracting here. We are returning safe response.
    // (If later you have a permitted extractor/provider, you can add it here.)
    return res.status(200).json({
      status: "pending",
      title: "",
      downloadUrl: "",
      message:
        "Link received ✅. Please paste direct MP4 link for download (demo mode)."
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      details: err.message
    });
  }
}
