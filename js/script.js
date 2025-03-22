const form = document.querySelector("form"),
  usernameInput = document.querySelector("input#username"),
  submit = document.querySelector("input[type=submit]"),
  suggestionsCon = document.querySelector(".suggestions"),
  reposCon = document.querySelector(".repos-container"),
  messageEl = document.querySelector(".message"),
  loadingEl = document.querySelector(".loading");

const suggestions = ["HazemHassan03", "torvalds", "OsamaElzero", "yyx990803", "jeresig", "angular", "vuejs", "nodejs", "ElzeroWebSchool", "jquery"];
for (let i = 0; i < suggestions.length; i++) {
  const random = Math.floor(Math.random() * suggestions.length);
  [suggestions[random], suggestions[i]] = [suggestions[i], suggestions[random]];
}
suggestions.forEach((suggestion) => {
  const suggestionEl = document.createElement("span");
  const suggestionText = document.createTextNode(suggestion);
  suggestionEl.appendChild(suggestionText);
  suggestionEl.classList.add("suggestion");
  suggestionsCon.appendChild(suggestionEl);
});
const suggestionEls = document.querySelectorAll(".suggestion");
suggestionEls.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    usernameInput.value = suggestion.textContent;
    usernameInput.focus();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (usernameInput.value) {
    while (reposCon.firstChild) {
      reposCon.removeChild(reposCon.firstChild);
    }
    messageEl.classList.remove("active");
    submit.disabled = true;
    loadingEl.classList.add("active");
    try {
      await fetchUser(usernameInput.value);
    } catch {
      showMessage("Something went wrong. Please try again.", true);
    }
    loadingEl.classList.remove("active");
    submit.disabled = false;
  } else {
    usernameInput.classList.add("invalid");
    usernameInput.addEventListener("input", () => {
      usernameInput.classList.remove("invalid");
    });
    usernameInput.addEventListener("focus", () => {
      usernameInput.classList.remove("invalid");
    });
  }
});

function showMessage(message, error) {
  messageEl.textContent = message;
  if (error) messageEl.classList.add("error");
  messageEl.classList.add("active");
}

async function fetchUser(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (response.status == 200) {
      const userInf = await response.json();
      showUser(userInf);
      try {
        await fetchRepos(usernameInput.value);
      } catch {
        showMessage("Something went wrong. Please try again.", true);
      }
    } else if (response.status == 404) {
      showMessage("The username is not found. Try another one.");
    } else if (response.status == 403) {
      showMessage("You have reached the maximum number of attempts. Please try again later.");
    } else {
      showMessage("Something went wrong. Please try again.", true);
    }
  } catch {
    showMessage("Something went wrong. Please try again.", true);
  }
}

async function fetchRepos(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (response.status == 200) {
      const repos = await response.json();
      if (repos.length == 0) {
        showMessage("No public repositories found for this username.");
      } else {
        showRepos(repos);
      }
    } else if (response.status == 403) {
      showMessage("You have reached the maximum number of attempts. Please try again later.");
    } else {
      showMessage("Something went wrong. Please try again.", true);
    }
  } catch {
    showMessage("Something went wrong. Please try again.", true);
  }
}

function showUser(user) {
  const userCard = document.createElement("div");
  userCard.classList.add("user-card");

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  const avatarImg = document.createElement("img");
  avatarImg.src = user.avatar_url;
  avatarImg.alt = "user-avatar";
  avatarDiv.appendChild(avatarImg);
  userCard.appendChild(avatarDiv);

  if (user.name) {
    const nameElement = document.createElement("h1");
    nameElement.classList.add("name");
    const nameText = document.createTextNode(user.name);
    nameElement.appendChild(nameText);
    userCard.appendChild(nameElement);
  }

  const typeElement = document.createElement("span");
  typeElement.classList.add("type");
  const typeText = document.createTextNode(` ${user.type}`);
  const typeIcon = document.createElement("i");
  typeIcon.classList.add("fa-brands", "fa-github");
  typeElement.appendChild(typeIcon);
  typeElement.appendChild(typeText);
  userCard.appendChild(typeElement);

  const followInfDiv = document.createElement("div");
  followInfDiv.classList.add("follow-inf");

  const followers = document.createElement("a");
  followers.classList.add("followers");
  followers.href = `${user.html_url}?tab=followers`;
  followers.target = "_blank";
  const followersTitle = document.createElement("h2");
  followersTitle.classList.add("title");
  followersTitle.appendChild(document.createTextNode("Followers"));
  const followersValue = document.createElement("span");
  followersValue.classList.add("value");
  followersValue.appendChild(document.createTextNode(formatNumber(user.followers)));
  followers.appendChild(followersTitle);
  followers.appendChild(followersValue);

  const following = document.createElement("a");
  following.classList.add("following");
  following.href = `${user.html_url}?tab=following`;
  following.target = "_blank";
  const followingTitle = document.createElement("h2");
  followingTitle.classList.add("title");
  followingTitle.appendChild(document.createTextNode("Following"));
  const followingValue = document.createElement("span");
  followingValue.classList.add("value");
  followingValue.appendChild(document.createTextNode(formatNumber(user.following)));
  following.appendChild(followingTitle);
  following.appendChild(followingValue);

  followInfDiv.appendChild(followers);
  followInfDiv.appendChild(following);
  userCard.appendChild(followInfDiv);

  const moreDiv = document.createElement("div");
  moreDiv.classList.add("more");

  if (user.location) {
    const locationSpan = document.createElement("span");
    locationSpan.classList.add("location");
    const locationIcon = document.createElement("i");
    locationIcon.classList.add("fa-solid", "fa-location-dot");
    locationSpan.appendChild(locationIcon);
    locationSpan.appendChild(document.createTextNode(` ${user.location}`));
    moreDiv.appendChild(locationSpan);
  } else {
    moreDiv.classList.add("location-not-found");
  }

  const profileLink = document.createElement("a");
  profileLink.href = user.html_url;
  profileLink.classList.add("profile-link");
  profileLink.target = "_blank";
  profileLink.appendChild(document.createTextNode("More "));
  const profileIcon = document.createElement("i");
  profileIcon.classList.add("fa-solid", "fa-arrow-up-right-from-square");
  profileLink.appendChild(profileIcon);
  moreDiv.appendChild(profileLink);
  userCard.appendChild(moreDiv);

  reposCon.appendChild(userCard);
}

function showRepos(repos) {
  repos.forEach((repo) => {
    const repoDiv = document.createElement("div");
    repoDiv.classList.add("repo");

    const nameElement = document.createElement("h2");
    nameElement.classList.add("name");
    const nameText = document.createTextNode(repo.name);
    nameElement.appendChild(nameText);
    repoDiv.appendChild(nameElement);

    const repoInfDiv = document.createElement("div");
    repoInfDiv.classList.add("repo-inf");

    const starsSpan = document.createElement("span");
    starsSpan.classList.add("stars");
    const starsIcon = document.createElement("i");
    starsIcon.classList.add("fa-solid", "fa-star");
    starsSpan.appendChild(starsIcon);
    starsSpan.appendChild(document.createTextNode(` Stars ${formatNumber(repo.stargazers_count)}`));

    const forksSpan = document.createElement("span");
    forksSpan.classList.add("forks");
    const forksIcon = document.createElement("i");
    forksIcon.classList.add("fa-solid", "fa-code-fork");
    forksSpan.appendChild(forksIcon);
    forksSpan.appendChild(document.createTextNode(` Forks ${formatNumber(repo.forks_count)}`));

    repoInfDiv.appendChild(starsSpan);
    repoInfDiv.appendChild(forksSpan);
    repoDiv.appendChild(repoInfDiv);

    const createDateDiv = document.createElement("div");
    createDateDiv.classList.add("create-date");
    const createDateTitle = document.createElement("span");
    createDateTitle.classList.add("title");
    createDateTitle.appendChild(document.createTextNode("Created At: "));
    const createDateValue = document.createElement("span");
    createDateValue.classList.add("value");
    createDateValue.appendChild(document.createTextNode(formatDate(repo.created_at)));
    createDateDiv.appendChild(createDateTitle);
    createDateDiv.appendChild(createDateValue);
    repoDiv.appendChild(createDateDiv);

    const latestUpdateDiv = document.createElement("div");
    latestUpdateDiv.classList.add("latest-update");
    const latestUpdateTitle = document.createElement("span");
    latestUpdateTitle.classList.add("title");
    latestUpdateTitle.appendChild(document.createTextNode("Latest Update: "));
    const latestUpdateValue = document.createElement("span");
    latestUpdateValue.classList.add("value");
    latestUpdateValue.appendChild(document.createTextNode(formatDate(repo.updated_at)));
    latestUpdateDiv.appendChild(latestUpdateTitle);
    latestUpdateDiv.appendChild(latestUpdateValue);
    repoDiv.appendChild(latestUpdateDiv);

    const repoLink = document.createElement("a");
    repoLink.href = repo.html_url;
    repoLink.classList.add("repo-link");
    repoLink.target = "_blank";
    repoLink.appendChild(document.createTextNode("More "));
    const repoLinkIcon = document.createElement("i");
    repoLinkIcon.classList.add("fa-solid", "fa-arrow-up-right-from-square");
    repoLink.appendChild(repoLinkIcon);
    repoDiv.appendChild(repoLink);

    reposCon.appendChild(repoDiv);
  });
}

function formatDate(date) {
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formattedDate;
}

function formatNumber(number) {
  return number < 1e3 ? number : number < 1e6 ? `${Math.trunc(number / 1e3)}K` : number < 1e9 ? `${Math.trunc(number / 1e6)}M` : "1B+";
}
