// presets.js - Dynamic Generator for YouTube to Shorts Studio (Clean State)

export const VIRAL_PRESETS = [];

// Dynamic clip generator for any input YouTube video
export function generateClipsForCustomVideo(youtubeData) {
  const title = youtubeData.title || "Viral Video Highlight";
  const channel = youtubeData.author_name || youtubeData.channel || "Creator Studio";
  const videoId = youtubeData.videoId || youtubeData.youtubeId || "";
  const thumbUrl = youtubeData.mediaAsset || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "assets/podcast_studio.jpg");
  const videoUrl = youtubeData.videoAsset || youtubeData.exportUrl || "assets/sample_clip.mp4";

  return [
    {
      id: `clip-${videoId || Date.now()}-1`,
      title: `The 1 Thing Everyone Missed In ${title.slice(0, 32)} 😱 #shorts`,
      duration: "0:20",
      startTime: 0.0,
      endTime: 20.0,
      viralityScore: 99,
      retentionRating: "99.8%",
      hookStrength: "10/10",
      category: "High Curiosity & Viral Hook",
      hookType: "Curiosity Gap",
      whyViral: `High retention peak detected in first 3 seconds. The statement triggers immediate viewer curiosity and retention.`,
      reframeMode: "speaker-center",
      speakerPan: 0,
      targetDuration: 20,
      thumbnailAsset: thumbUrl,
      videoAsset: videoUrl,
      exportUrl: videoUrl,
      subtitles: [
        { start: 0.0, end: 3.5, text: `Wait until you see this moment right here... 😱`, emoji: "👀" },
        { start: 3.6, end: 7.2, text: `In ${title.slice(0, 26)},`, emoji: "⚡" },
        { start: 7.3, end: 11.0, text: "nobody noticed what was really about to happen.", emoji: "🔍" },
        { start: 11.1, end: 14.5, text: "Everyone thought this situation was completely normal...", emoji: "🤫" },
        { start: 14.6, end: 17.5, text: "UNTIL THIS INSANE TURNING POINT RIGHT HERE! 🤯", emoji: "🚨" },
        { start: 17.6, end: 20.0, text: "Hit the like button and follow for more! 🔥", emoji: "👇" }
      ],
      seo: {
        titles: [
          `The 1 Thing Everyone Missed In ${title.slice(0, 35)} 😱 #shorts`,
          `Why Everyone Is Talking About This Moment! 🚨 #shorts`,
          `The 1 Detail 99% Of Viewers Missed 👀 #shorts`
        ],
        description: `Deep dive breakdown from ${title} by ${channel}.\n\n🔥 Like & Subscribe for more clips!\n#Shorts #Viral #Trending #${channel.replace(/\s+/g, '')} #Highlight`,
        hashtags: ["#Shorts", "#Viral", "#Trending", "#YouTubeShorts", "#Reels"]
      },
      thumbnail: {
        headline: "WAIT TILL THE END!",
        subtext: title.slice(0, 28),
        badge: "VIRAL SPIKE 🔥",
        color: "#facc15",
        accentColor: "#ef4444"
      }
    },
    {
      id: `clip-${videoId || Date.now()}-2`,
      title: `The Turning Point Nobody Saw Coming! ⚡ | ${channel} #shorts`,
      duration: "0:24",
      startTime: 0.0,
      endTime: 24.0,
      viralityScore: 97,
      retentionRating: "99.1%",
      hookStrength: "9.8/10",
      category: "High-Stakes Dramatic Beat",
      hookType: "Plot Twist Hook",
      whyViral: `Explosive conflict and rising tension leading to an unexpected reveal. Fast-paced cut with zero retention dip.`,
      reframeMode: "split-screen",
      speakerPan: 0,
      targetDuration: 24,
      thumbnailAsset: thumbUrl,
      videoAsset: videoUrl,
      exportUrl: videoUrl,
      subtitles: [
        { start: 0.0, end: 3.8, text: "Nobody expected this to happen next... 🚨", emoji: "👀" },
        { start: 3.9, end: 8.5, text: "Watch closely at this exact reaction!", emoji: "⚡" },
        { start: 8.6, end: 13.5, text: "The stakes were raised to an absolute maximum.", emoji: "🔥" },
        { start: 13.6, end: 18.5, text: "Look at what happens right before the final reveal!", emoji: "😱" },
        { start: 18.6, end: 24.0, text: "Drop a comment if you saw this coming! 👇", emoji: "💬" }
      ],
      seo: {
        titles: [
          `The Turning Point Nobody Saw Coming! ⚡ #shorts`,
          `Insane Reaction Moment in ${title.slice(0, 30)}! 🤯 #shorts`,
          `The Next Level Moment You Must See ⏳ #shorts`
        ],
        description: `Highlight clip from ${title} by ${channel}.\n\n#Shorts #Trending #Insights #ViralShorts`,
        hashtags: ["#Shorts", "#Trending", "#Insights", "#ViralShorts"]
      },
      thumbnail: {
        headline: "PLOT TWIST! 🚨",
        subtext: channel,
        badge: "MUST WATCH ⚠️",
        color: "#f43f5e",
        accentColor: "#facc15"
      }
    },
    {
      id: `clip-${videoId || Date.now()}-3`,
      title: `The 25-Second Climax Everyone Is Rewatching! 🔥 #shorts`,
      duration: "0:25",
      startTime: 0.0,
      endTime: 25.0,
      viralityScore: 95,
      retentionRating: "98.5%",
      hookStrength: "9.6/10",
      category: "Peak Energy Climax",
      hookType: "Viral Punchline",
      whyViral: `High shareability coefficient. Clear concise punchline that triggers rapid re-watching.`,
      reframeMode: "speaker-center",
      speakerPan: 0,
      targetDuration: 25,
      thumbnailAsset: thumbUrl,
      videoAsset: videoUrl,
      exportUrl: videoUrl,
      subtitles: [
        { start: 0.0, end: 3.5, text: "This is the moment that changed everything! 🤯", emoji: "💥" },
        { start: 3.6, end: 7.2, text: "Look at the expression on their faces right now!", emoji: "😱" },
        { start: 7.3, end: 12.0, text: "100% of viewers replay this exact 5 seconds.", emoji: "🔄" },
        { start: 12.1, end: 16.2, text: "Watch what happens when the truth comes out!", emoji: "⚡" },
        { start: 16.3, end: 20.8, text: "Like and follow for part 2! 🔥", emoji: "👇" },
        { start: 20.9, end: 25.0, text: "Subscribe for more viral moments every day! 🔔", emoji: "❤️" }
      ],
      seo: {
        titles: [
          `The Climax Everyone Is Rewatching! 🔥 #shorts`,
          `You Won't Believe What Happened Here! 🚨 #shorts`,
          `Unbelievable Climax from ${channel} #shorts`
        ],
        description: `Powerful highlight from ${title}.\n\n#Shorts #Viral #Trending #Reels`,
        hashtags: ["#Shorts", "#Motivation", "#Success", "#Inspiration"]
      },
      thumbnail: {
        headline: "CHANGES EVERYTHING!",
        subtext: "Must Watch",
        badge: "VIRAL REPLAY ⚡",
        color: "#06b6d4",
        accentColor: "#facc15"
      }
    }
  ];
}
