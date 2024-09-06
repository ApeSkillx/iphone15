import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

const VideoCarousel = () => {
  // Refs to hold references to video elements, their corresponding span elements (for progress), and div elements
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  // State to manage video playback and carousel status
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  // State to track loaded video data
  const [loadedData, setLoadedData] = useState([]);
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  // GSAP animation hook for carousel and video playback control
  useGSAP(() => {
    // Animation to slide the carousel to show the correct video based on videoId
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut", // Smooth transition effect
    });

    // GSAP animation to play the video when it is in view
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none", // Restart animation when video comes into view
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      // GSAP animation to update the progress bar as the video plays
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          // Calculate progress percentage
          const progress = Math.ceil(anim.progress() * 100);

          if (progress !== currentProgress) {
            currentProgress = progress;

            // Adjust progress bar width based on screen size
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw" // Mobile screen
                  : window.innerWidth < 1200
                  ? "10vw" // Tablet screen
                  : "4vw", // Desktop screen
            });

            // Update progress bar color based on progress
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        // Animation completion handler
        onComplete: () => {
          if (isPlaying) {
            // Change progress bar to a fixed size and color when video ends
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (videoId === 0) {
        anim.restart(); // Restart animation for the first video
      }

      // Function to update the progress bar based on video playback
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        // Update progress bar continuously while video is playing
        gsap.ticker.add(animUpdate);
      } else {
        // Remove ticker if video is paused
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay, isPlaying]);

  useEffect(() => {
    if (loadedData.length > 3) {
      // Control video playback based on state and loaded data
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  // Handles video control actions such as play, pause, and reset
  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;

      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;

      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
        break;

      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      default:
        return video;
    }
  };

  // Handles video metadata loading
  const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]);

return (
  <>
    {/* Container for video carousel */}
    <div className="flex items-center">
      {/* Map through each slide from `hightlightsSlides` to create video elements */}
      {hightlightsSlides.map((list, i) => (
        <div key={list.id} id="slider" className="sm:pr-20 pr-10">
          <div className="video-carousel_container">
            {/* Container for video with rounded corners and black background */}
            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
              <video
                id="video"
                playsInline={true}
                className={`${
                  list.id === 2 && "translate-x-44"
                } pointer-events-none`}
                preload="auto"
                muted
                ref={(el) => (videoRef.current[i] = el)} // Store reference to video element
                onEnded={() =>
                  i !== 3
                    ? handleProcess("video-end", i) // Move to the next video on end
                    : handleProcess("video-last") // Handle last video scenario
                }
                onPlay={() =>
                  setVideo((pre) => ({ ...pre, isPlaying: true })) // Update state when video plays
                }
                onLoadedMetadata={(e) => handleLoadedMetaData(i, e)} // Update state with video metadata
              >
                <source src={list.video} type="video/mp4" />
              </video>
            </div>

            {/* Text overlay on top of the video */}
            <div className="absolute top-12 left-[5%] z-10">
              {list.textLists.map((text, i) => (
                <p key={i} className="md:text-2xl text-xl font-medium">
                  {text} {/* Display text associated with the video */}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Progress indicators and controls */}
    <div className="relative flex-center mt-10">
      {/* Container for progress indicators */}
      <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
        {videoRef.current.map((_, i) => (
          <span
            key={i}
            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            ref={(el) => (videoDivRef.current[i] = el)} // Reference for each progress indicator
          >
            <span
              className="absolute h-full w-full rounded-full"
              ref={(el) => (videoSpanRef.current[i] = el)} // Reference for progress bar inside the indicator
            />
          </span>
        ))}
      </div>

      {/* Control button for play/pause and replay */}
      <button className="control-btn">
        <img
          src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
          alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"} // Update image based on video state
          onClick={
            isLastVideo
              ? () => handleProcess("video-reset") // Reset video if it's the last video
              : !isPlaying
              ? () => handleProcess("play") // Play video if it's currently paused
              : () => handleProcess("pause") // Pause video if it's currently playing
          }
        />
      </button>
    </div>
  </>
);
};

export default VideoCarousel;