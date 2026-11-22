import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import PhotoSwipeVideoPlugin from "photoswipe-video-plugin";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";

document.querySelectorAll(".image-grid").forEach((gallery, index) => {
  const galleryId = gallery.getAttribute("data-gallery");
  const lightbox = new PhotoSwipeLightbox({
    gallery: `[data-gallery="${galleryId}"]`,
    children: "a",
    pswpModule: () => import("photoswipe"),
    showHideAnimationType: "none",
    zoomAnimationDuration: false,
    initialZoomLevel: "fit",
    secondaryZoomLevel: "fit",
  });

  // Autoplay is handled below instead of by the plugin, so a blocked play()
  // doesn't become an unhandled promise rejection.
  new PhotoSwipeVideoPlugin(lightbox, { autoplay: false });

  lightbox.on("contentActivate", ({ content }) => {
    if (content.data.type === "video" && content.element) {
      content.element.play().catch(() => {});
    }
  });

  // Without a poster, the plugin sets poster="undefined" and never marks the
  // slide as loaded. Use the video's own first frame instead.
  lightbox.on("contentLoad", ({ content }) => {
    if (content.data.type !== "video" || content.data.msrc) return;
    const video = content.element;
    if (!video || video.dataset.pureLoadHooked) return;
    video.dataset.pureLoadHooked = "1";
    video.removeAttribute("poster");
    const onLoaded = () => content.onLoaded();
    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("error", onLoaded, { once: true });
  });

  new PhotoSwipeDynamicCaption(lightbox, {
    type: "auto",
    captionContent: `.pswp-caption-content-${index}`,
  });

  lightbox.init();
});
