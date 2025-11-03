import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
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

  new PhotoSwipeDynamicCaption(lightbox, {
    type: "auto",
    captionContent: `.pswp-caption-content-${index}`,
  });

  lightbox.init();
});
