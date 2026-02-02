import React, { Component, Fragment } from "react";
import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    fetch("URL")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState({ status: resData.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }
    const graphqlQuery = {
      query: `
    query {
      getPosts {
        _id
        title
        content
        imageUrl
        creator {
          name
        }
        createdAt
        updatedAt
      }
    }
  `,
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        console.log(res);
        if (res.status !== 201 && res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        // Handle different response structures
        const posts =
          resData.data.getPosts ||
          (Array.isArray(resData.data.getPosts)
            ? resData
            : [resData.data.getPosts]);
        const totalItems = resData.data.getPosts || posts.length;
        this.setState({
          posts: posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
            };
          }),
          totalPosts: totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();
    fetch("URL")
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });

    const formData = new FormData();
    if (postData.image) {
      formData.append("image", postData.image);
    }
    if (this.state.editPost) {
      formData.append("oldPath", this.state.editPost.imageUrl);
    }

    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
      body: formData,
    })
      .then((resImageData) => resImageData.json())
      .then((imageData) => {
        const imageUrl = imageData.filePath || this.state.editPost.imageUrl; // Fallback if no new image

        let graphqlQuery = {
          query: `
          mutation {
            createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}"}) {
              _id title content creator { name } createdAt imageUrl
            }
          }
        `,
        };

        if (this.state.editPost) {
          graphqlQuery = {
            query: `
            mutation {
              updatePost(postId: "${this.state.editPost._id}", postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}"}) {
                _id title content creator { name } createdAt imageUrl
              }
            }
          `,
          };
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + this.props.token, // Using props.token for consistency
            "Content-Type": "application/json",
          },
        });
      })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        const resDataField = this.state.editPost ? "updatePost" : "createPost";
        const post = resData.data[resDataField];

        this.setState((prevState) => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = updatedPosts.findIndex((p) => p._id === post._id);
            updatedPosts[postIndex] = post;
          } else {
            updatedPosts = prevState.posts.concat(post);
          }

          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });

    const graphqlQuery = {
      query: `
        mutation deletePost($postId: ID!) {
          deletePost(postId: $postId)
        }
      `,
      variables: {
        postId: postId,
      },
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Deleting a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState((prevState) => {
          const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
          return { posts: updatedPosts, postsLoading: false };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error, postsLoading: false });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => {
                const imageUrl =
                  post.imageUrl && post.imageUrl.startsWith("http")
                    ? post.imageUrl
                    : `http://localhost:8080/${post.imageUrl}`;
                return (
                  <Post
                    key={post._id}
                    id={post._id}
                    author={
                      post.creator && post.creator.name
                        ? post.creator.name
                        : "Unknown"
                    }
                    date={new Date(post.createdAt).toLocaleDateString("en-US")}
                    title={post.title}
                    image={imageUrl}
                    content={post.content}
                    onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                    onDelete={this.deletePostHandler.bind(this, post._id)}
                  />
                );
              })}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
