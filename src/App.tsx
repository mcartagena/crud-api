import React from "react";
import logo from "./logo.svg";
import "./App.css";
import axios, { CancelTokenSource } from "axios";

interface IPost {
  userId: number;
  id?: number;
  title: string;
  body: string;
}

interface IState {
  posts: IPost[];
  error: string;
  cancelTokenSource?: CancelTokenSource;
  loading: boolean;
}

class App extends React.Component<{}, IState> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      posts: [],
      error: "",
      loading: true
    };
  }

  public componentDidMount() {
    const cancelToken = axios.CancelToken;
    const cancelTokenSource = cancelToken.source();
    this.setState({ cancelTokenSource });
    axios
      // .get<IPost[]>("https://jsonplaceholder.typicode.com/postsX", {
      .get<IPost[]>("https://jsonplaceholder.typicode.com/posts", {
        cancelToken: cancelTokenSource.token,
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000
      })
      .then(response => {
        this.setState({ posts: response.data, loading: false });
      })
      .catch(ex => {
        const error = axios.isCancel(ex)
          ? "Request cancelled"
          : ex.code === "ECONNABORTED"
          ? "A timeout has occurred"
          : ex.response.status === 404
          ? "Resource not found"
          : "An unexpected error has occurred";
        this.setState({ error, loading: false });
      });
      // cancelTokenSource.cancel("User cancelled operation");
  }

  private handleCancelClick = () => {
    if (this.state.cancelTokenSource) {
      this.state.cancelTokenSource.cancel("User cancelled operation");
    }
  };

  public render() {
    return (
      <div className="App">
        {this.state.loading && (
          <button onClick={this.handleCancelClick}>Cancel</button>
        )}
        <ul className="posts">
          {this.state.posts.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </li>
          ))}
        </ul>
        {this.state.error && <p className="error">{this.state.error}</p>}
      </div>
    );
  }
}

export default App;
