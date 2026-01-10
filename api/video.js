export default function handler(req, res) {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  res.status(200).json({
    status: "success",
    input: videoUrl,
    message: "API working ✅"
  });
}
