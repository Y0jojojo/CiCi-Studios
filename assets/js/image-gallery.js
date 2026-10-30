(() => {
  const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
  const videoExtensions = new Set([".mov", ".mp4", ".webm", ".ogv"]);

  const createFigure = (imageUrl, filename, className = "poster") => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    figure.className = className;
    image.src = imageUrl;
    image.alt = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    image.loading = "lazy";
    figure.append(image);
    return figure;
  };

  const createVideoFigure = (videoUrl, filename, className = "poster") => {
    const figure = document.createElement("figure");
    const video = document.createElement("video");
    const source = document.createElement("source");
    figure.className = className;
    video.controls = true;
    video.preload = "none";
    video.playsInline = true;
    video.setAttribute("aria-label", `Video: ${filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}`);
    source.src = videoUrl;
    video.append(source, "Your browser cannot play this video format.");
    figure.append(video);
    return figure;
  };

  document.querySelectorAll("[data-image-gallery]").forEach((gallery) => {
    const template = gallery.parentElement.querySelector("[data-image-template]");
    const emptyState = gallery.parentElement.querySelector("[data-gallery-empty]");
    const errorState = gallery.parentElement.querySelector("[data-gallery-error]");
    const galleryIntro = gallery.parentElement.querySelector("[data-gallery-intro]");
    const hasUnrenderedTemplate = template?.content.textContent.includes("site.static_files");

    if (!template || !emptyState) {
      console.error("Image gallery is missing its template or empty state.", gallery);
      return;
    }

    const setGalleryHasImages = (hasImages) => {
      emptyState.hidden = hasImages;
      if (galleryIntro) galleryIntro.hidden = hasImages;
    };

    if (!hasUnrenderedTemplate) {
      gallery.append(template.content.cloneNode(true));
      setGalleryHasImages(gallery.children.length > 0);
      return;
    }

    const directory = new URL(gallery.dataset.imageDirectory, document.baseURI);
    const supportsVideo = gallery.dataset.galleryVideos === "true";
    fetch(directory)
      .then((response) => {
        if (!response.ok) throw new Error(`Image folder request failed: ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const listing = new DOMParser().parseFromString(html, "text/html");
        const mediaUrls = Array.from(listing.querySelectorAll("a[href]"))
          .map((link) => new URL(link.getAttribute("href"), directory))
          .filter((url) => {
            const filename = url.pathname.split("/").pop().toLowerCase();
            const extension = filename.slice(filename.lastIndexOf("."));
            return url.origin === directory.origin
              && url.pathname.startsWith(directory.pathname)
              && !filename.includes("/")
              && (imageExtensions.has(extension) || (supportsVideo && videoExtensions.has(extension)));
          })
          .sort((first, second) => first.pathname.localeCompare(second.pathname));

        mediaUrls.forEach((url) => {
          const filename = decodeURIComponent(url.pathname.split("/").pop());
          const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
          const className = gallery.dataset.imageClass || "poster";
          const figure = videoExtensions.has(extension)
            ? createVideoFigure(url.href, filename, className)
            : createFigure(url.href, filename, className);
          gallery.append(figure);
        });

        setGalleryHasImages(mediaUrls.length > 0);
      })
      .catch((error) => {
        if (errorState) errorState.hidden = false;
        console.error(`Could not load gallery images from ${directory.pathname}.`, error);
      });
  });
})();
