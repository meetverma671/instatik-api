export default async function handler(req, res) {
  const inputUrl = req.query.url;

  if (!inputUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  // ✅ If user already pasted direct mp4 link
  if (inputUrl.includes(".mp4")) {
    return res.status(200).json({
      status: "success",
      type: "direct_mp4",
      downloadUrl: inputUrl,
      message: "Direct MP4 link detected ✅",
    });
  }

  // ✅ Instagram link detection
  if (inputUrl.includes("instagram.com")) {
    return res.status(200).json({
      status: "success",
      type: "instagram",
      message:
        "Instagram link detected ✅ but direct mp4 extraction is not implemented yet.",
    });
  }

  // ✅ TikTok link detection
  if (inputUrl.includes("tiktok.com")) {
    return res.status(200).json({
      status: "success",
      type: "tiktok",
      message:
        "TikTok link detected ✅ but direct mp4 extraction is not implemented yet.",
    });
  }

  // Default
  return res.status(200).json({
    status: "success",
    type: "unknown",
    message: "Unsupported URL type.",
    input: inputUrl,
  });
}
