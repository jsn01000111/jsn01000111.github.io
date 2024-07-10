     const allStories = [
      {
        id: 0,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhDjSmw_TObLv4Rs650mtPNAEyM5qqzqMQhe9PL1ky5ETK_wLPB3q3FogIlQqbgcgRc1t9IvsjASAU6ax0Df-QCTraAW5lvBM2k8zx68KLob8pPMZOQh4sp6dJlInTEH2kRTdZdV5VOYoRuL_dpQlLVE4IcOjWJwYzs4lWZczD9cTncQTWo95_yS-P0cxs/s1600/Programmer%20with%20ai.jpg",
        imageLink: "https://jasongvia.blogspot.com/2023/01/programming-with-ai.html",
      },
      {
        id: 1,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgH4xKNHWE-vkKe80gFeVkhq-V4n2jCadXEqKAGangbtMvc6HV-4MzxKnpNbVlfzwV4dQ7XHF9xiGIpfSUC7apMVpb18ohFMuRFCQZ-3xFRXkvOz5VxMgm0OMj0pJNP1FfDrr_GL0alThCXvjXbBj7evTlREYS710dVPAn9JFmJM8ySvASeUmR42PTkdh0/s1600/Quote%20of%20the%20day%20.jpg",
        imageLink: "https://jasongvia.blogspot.com/2024/05/you-define-your-own-life-dont-let-other.html",
      },
      {
        id: 2,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvnXk56upjT1tWnzNIt53GfbCfvpQJC60_TY-wHi8OQKS5EbDbEkHYqOgHQQgoGdarIQCyIZ3tUiAvkm5Bt3Xdp4Mlie642_kPEuqKMbA1GoiDhhmvrFLHuOTx__jeDmy4oPCLaQSw_TfKMfBBuv_D6Rah38aFcZB5uNmZM5ioWArq_r4z-pTvVEAvBiQ/s1600/Wordpress%20twenty%20twenty%20four.jpg",
        imageLink: "https://jasongvia.blogspot.com/2024/05/Start%20Wordpress%20Website%20Free%20Hosting.html",
      },
      {
        id: 3,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhaQeiaAtrzmXBIs4n8BgDTFraTvIpCD4AG_v2sOi0xJhMf3BHoWMLbW5n42HoMv-qv1OoZKVm9rYzs8yC7imkUmFxsW3jpDOEF7QLmKhGE5kWTtW8OCit-ZaEk0kwahEx2EyxDRED_rcWIAs-vtv_3rH_X2jOsqiY3f-_ohuTHzNdz_szszxk1EAnKsLg/s1600/Music%20error%20404.jpg",
        imageLink: "https://jasongvia.blogspot.com/2024/05/Best%20Anime%20of%20All%20Time.html",
      },
      {
        id: 4,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgv9APSXHdWMOc_zd8a11c82c8nD2rc2Q-s0Foc_ovtanaNucv44JT60vs8AzjYNSkxlL5bCKqPt1G3IvadiezSygOCCvaRq-7_x5e1fM3TxFgnVzKGyPaHhy7BH52IY5kV6L9v9oc49LHOWvJuWQEBQxph-65UwvAemit8TeFmtqtd6ZSa7-CJj7mAEJY/s1600/Todays%20technology.jpg",
        imageLink: "https://jasongvia.blogspot.com/2024/06/the-pros-and-cons-of-todays-technology.html",
      },
      {
        id: 5,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEh7j6cpgEuK7L_YtuYV-rrIAKQCjp7nPV_EqV1bcBQhDHE-bgnYZgeKNGhYHAjIIpH0jspIx4pgQqQg2Nm5C8A4D3VQl3M7nLCqaDixCwDFeokFxtDoQSG_RdUphhHJ-IQ-2FMrZJT7d05ck4CNR1L9rq9xEma6XzzxcE4ZbumbeC0R0Cre3rIkCHGJE/s1600/Playing%20space%20impact.jpg",
        imageLink: "https://jasongvia.blogspot.com/2021/04/playing-space-impact.html",
      },
      {
        id: 6,
        author: "Jason G",
        imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEilYd3LqOOmHkE9qjEoVyyHQYILmWWQdYyike5lfxX7KFoV3lWiqy1Ye0XmCqn5YLQKGNY4xsDk6c5MW3BC4Lv_vL7b-eJCTapHbZyt6z-efJ7bsKCifBf1kkPdFSG04vdyeomgRobUBA7jMSi7A0jTSDswwOdrsKR2OOBRP-M1HM-Zqd1YLzd54uEHye8/s1600/Contra%20game%20over.jpg",
        imageLink: "https://jasongvia.blogspot.com/2024/05/neca-reel-toys-contra-retro-gaming.html",
      },
    ];

const stories = document.querySelector(".stories");
const storiesFullView = document.querySelector(".stories-full-view");
const closeBtn = document.querySelector(".close-btn");
const storyImageFull = document.querySelector(".stories-full-view .story img");
const storyAuthorFull = document.querySelector(".stories-full-view .story .author");
const nextBtn = document.querySelector(".stories-container .next-btn");
const previousBtn = document.querySelector(".stories-container .previous-btn");
const storiesContent = document.querySelector(".stories-container .content");
const nextBtnFull = document.querySelector(".stories-full-view .next-btn");
const previousBtnFull = document.querySelector(".stories-full-view .previous-btn");

let currentActive = 0;

const createStories = () => {
  allStories.forEach((s, i) => {
    const story = document.createElement("div");
    story.classList.add("story");

    // Create anchor tag
    const link = document.createElement("a");
    link.href = "#"; // Default link, actual link set later in updateFullView

    // Create image tag
    const img = document.createElement("img");
    img.src = s.imageUrl;

    // Append image to anchor tag
    link.appendChild(img);

    // Create author element
    const author = document.createElement("div");
    author.classList.add("author");
    author.innerHTML = s.author;

    // Append anchor tag and author to story container
    story.appendChild(link);
    story.appendChild(author);

    // Append story to stories container
    stories.appendChild(story);

    // Add click event to show full view
    story.addEventListener("click", () => {
      showFullView(i);
    });
  });
};

createStories();

const showFullView = (index) => {
  currentActive = index;
  updateFullView();
  storiesFullView.classList.add("active");
};

closeBtn.addEventListener("click", () => {
  storiesFullView.classList.remove("active");
});

const updateFullView = () => {
  storyImageFull.src = allStories[currentActive].imageUrl;
  storyImageFull.parentElement.href = allStories[currentActive].imageLink || "#";
  storyAuthorFull.innerHTML = allStories[currentActive].author;
};

storyImageFull.addEventListener("click", () => {
  const link = allStories[currentActive].imageLink;
  if (link) {
    // Do something with the image link, for example:
    window.location.href = link; // Redirects the current tab to the link
    // Or you can perform some other action based on the link
  }
});

nextBtn.addEventListener("click", () => {
  storiesContent.scrollLeft += 300;
});

previousBtn.addEventListener("click", () => {
  storiesContent.scrollLeft -= 300;
});

storiesContent.addEventListener("scroll", () => {
  if (storiesContent.scrollLeft <= 24) {
    previousBtn.classList.remove("active");
  } else {
    previousBtn.classList.add("active");
  }

  let maxScrollValue =
    storiesContent.scrollWidth - storiesContent.clientWidth - 24;

  if (storiesContent.scrollLeft >= maxScrollValue) {
    nextBtn.classList.remove("active");
  } else {
    nextBtn.classList.add("active");
  }
});

nextBtnFull.addEventListener("click", () => {
  if (currentActive >= allStories.length - 1) {
    return;
  }
  currentActive++;
  updateFullView();
});

previousBtnFull.addEventListener("click", () => {
  if (currentActive <= 0) {
    return;
  }
  currentActive--;
  updateFullView();
});
