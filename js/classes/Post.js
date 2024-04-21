import Button from "./Button.js";
import API from "./API.js";
import Comment from "./Comment.js";

export default class Post {
  constructor(post) {
    this.post = post;
    this.postElement = this.createElement("div", "card");
    this.createPostElement();
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  }

  timeAgo(saved) {
    const savedDate = new Date(saved);
    const now = new Date();
    const diffInMilliseconds = now - savedDate;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) return `${diffInYears} year(s) ago`;
    if (diffInMonths > 0) return `${diffInMonths} month(s) ago`;
    if (diffInWeeks > 0) return `${diffInWeeks} week(s) ago`;
    if (diffInDays > 0) return `${diffInDays} day(s) ago`;
    if (diffInHours > 0) return `${diffInHours} hour(s) ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute(s) ago`;
    return `a moment ago`;
  }

  async createPostElement() {
    const deletePostButton = new Button(
      "Delete post",
      "btn-danger"
    ).getElement();
    deletePostButton.addEventListener("click", async () => {
      await API.deletePost(this.post.post_id);
      this.postElement.remove();
    });

    const titleElement = this.createElement("h2", "card-title");
    const titleLink = this.createElement("a", "");
    titleLink.href = `/post.html?post_id=${this.post.post_id}`;
    titleLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = `/post.html?post_id=${this.post.post_id}`;
    });
    titleLink.appendChild(titleElement);
    const contentElement = this.createElement("p", "card-text");
    const userNameElement = this.createElement("span", "post-user-name");
    const editPostButton = new Button("Edit post", "btn-primary").getElement();
    const user = await API.fetchUser(this.post.user_id);
    this.post.user_name = user.user_name;
    userNameElement.textContent = `Posted by ${this.post.user_name}`;

    const timeAgoElement = this.createElement("span", "post-time-ago");
    timeAgoElement.textContent = `Posted ${this.timeAgo(this.post.saved)}`;

    editPostButton.addEventListener("click", async () => {
      if (editPostButton.textContent === "Edit post") {
        titleElement.contentEditable = true;
        contentElement.contentEditable = true;
        editPostButton.textContent = "Save Edit";
        editPostButton.classList.replace("btn-primary", "btn-success");
      } else {
        titleElement.contentEditable = false;
        contentElement.contentEditable = false;
        editPostButton.textContent = "Edit post";
        editPostButton.classList.replace("btn-success", "btn-primary");
        const updatedPost = await API.editPost(
          this.post.post_id,
          titleElement.textContent,
          contentElement.textContent
        );
        userNameElement.textContent = `Posted by ${this.post.user_name}`;
      }
    });

    const commentsElement = this.createElement("div", "list-group");
    const comments = await API.fetchComments(this.post.post_id);
    comments.forEach((comment) => {
      const commentItem = new Comment(
        this.post.post_id,
        comment
      ).getCommentItem();
      commentsElement.appendChild(commentItem);
    });

    const reactButton = this.createElement("button", "btn btn-secondary");
    let hasReacted = false;
    let reactionCount = 0;

    const updateReactButton = () => {
      reactButton.textContent = `React (${reactionCount})`;
      reactButton.className = hasReacted
        ? "btn btn-success"
        : "btn btn-secondary";
    };

    reactButton.addEventListener("click", async () => {
      if (hasReacted) {
        await API.removeReactcion(this.post.post_id);
        reactionCount--;
      } else {
        await API.addReaction(this.post.post_id, 1); 
        reactionCount++;
      }
      hasReacted = !hasReacted;
      updateReactButton();
    });

    const reactions = await API.fetchReactions(this.post.post_id);
    hasReacted = reactions.userReacted;
    reactionCount = reactions.reactions;
    updateReactButton();

    const commentButton = new Button("Comment", "btn-secondary").getElement();
    const commentInput = this.createElement("input", "form-control mb-2");
    commentInput.type = "text";
    commentInput.placeholder = "Add a comment";
    commentInput.style.display = "none";

    const postCommentButton = new Button(
      "Post comment",
      "btn-primary"
    ).getElement();
    postCommentButton.style.display = "none";

    commentButton.addEventListener("click", () => {
      commentInput.style.display = "block";
      postCommentButton.style.display = "block";
    });

    postCommentButton.addEventListener("click", async () => {
      const commentContent = commentInput.value;
      if (commentContent) {
        const newComment = await API.addComment(
          this.post.post_id,
          commentContent
        );
        if (newComment) {
          const commentItem = new Comment(
            this.post.post_id,
            newComment
          ).getCommentItem();
          commentsElement.appendChild(commentItem);
          commentInput.value = "";
          commentInput.style.display = "none";
          postCommentButton.style.display = "none";
        }
      }
    });

    titleElement.textContent = this.post.title;
    contentElement.textContent = this.post.post_content;

    this.postElement.append(
      deletePostButton,
      editPostButton,
      titleLink,
      contentElement,
      userNameElement,
      timeAgoElement,
      commentsElement,
      reactButton, 
      commentButton,
      commentInput,
      postCommentButton
    );
  }
}
