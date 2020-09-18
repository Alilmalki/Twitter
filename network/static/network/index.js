//Paginator will be implemented later.

class PostForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            content: ''
        };
    }

    updateContent(event){
        this.setState({
            content: event.target.value
        });
    }

    sendPost(event){

        const content = this.state.content;

        fetch('/sendPost', {
            method: 'POST',
            body: JSON.stringify({
                content: content
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        });

        event.preventDefault();
  
    }

    render(){
        return(
            <div className = "post-form">
                <h3>New Post</h3>
                <form onSubmit = {this.sendPost.bind(this)}>
                    <textarea onChange = {this.updateContent.bind(this)} rows = "5" cols = "80"></textarea>
                    <button>Post</button>
                </form>
            </div>
        )
    }
}

class AllPosts extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            currentUsername: '',
            allPosts: [],
            
        };
        this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
    }

    rerenderParentCallback() {
        console.log("force update called");
        this.forceUpdate();
    }

    async componentDidMount(){

        await fetch('/currentUser')
        .then(response => response.json())
        .then(user => {
            this.setState({
                currentUsername: user.username
            });
        });

        await fetch('/allPosts')
        .then(response => response.json())
        .then(allPosts => {
            this.setState({
                allPosts: allPosts
            });
        });

    }

    render(){
        return (
            <div className = "all-posts">
                
                {this.state.allPosts.map(post =>
                        
                        <Post 
                            id = {post.id}
                            currentUsername = {this.state.currentUsername}
                            owner = {post.owner}
                            content = {post.content}
                            time = {post.time}
                            likes = {post.likes}
                            />
                              
                )}
            </div>    
        )
    }
}
class Post extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            id: this.props.id,
            currentUsername: this.props.currentUsername,
            owner: this.props.owner,
            content: this.props.content,
            time: this.props.time,
            likes: this.props.likes,

            editable: false,
            

        };
        
    }

    async like(){
         await fetch(`likePost/${this.state.id}`)
         .then(response => response.json())
         .then(post => {
            this.setState({
                likes: post.likes
            })
         });
         
         
    }

    async unlike(){
        await fetch(`unlikePost/${this.state.id}`)
        .then(response => response.json())
        .then(post => {
            this.setState({
                likes: post.likes
            })
        })
    
    }

    handleLikeButton(){

            try{
                this.state.likes.forEach(liker => {//liker is a username
                    if(liker == this.state.currentUsername){ //the current user already liked the post
                        throw BreakException;
                    }
                });
            }
            catch(e){
                return <button onClick = {() => {this.unlike()}}>Unlike</button>;
            }
                
            
            return <button onClick = {() => {this.like()}}>Like</button>;
                
    }

    async updateContent(event){
        
        await fetch(`/updatePost/${this.state.id}/${event.target.value}`)
        .then(response => response.json())
        .then(message => {
            console.log(message);
        })
        
        
    }

    async save(){

        await fetch(`/getNewContent/${this.state.id}`)
        .then(response => response.json())
        .then(post => {
            this.setState({
                editable: false,
                content:post.content
            })
        })
        
        
    }

    render() {
        
        return (
            <div className = "post">
                {this.state.editable
                    ?   
                    <div>   
                        <h3 onClick = {() => ReactDOM.render(<Profile clickedUsername = {this.state.owner}/>, document.querySelector("#container")) }>{this.state.owner}</h3>
                        <form>
                            <textarea onChange = {(e) => {this.updateContent(e)}}>{this.state.content}</textarea>
                            <button onClick = {() => {this.save(this.state.content)}}>Save</button>
                        </form>
                        <p>{this.state.time}</p>
                        <p>{this.state.likes.length} like(s)</p>
                        {this.handleLikeButton()}
                    </div>
                    :   
                    <div>
                        <h3 onClick = {() => ReactDOM.render(<Profile clickedUsername = {this.state.owner}/>, document.querySelector("#container")) }>{this.state.owner}</h3>
                        <p>{this.state.content}</p>

                        {this.state.currentUsername == this.state.owner
                            ? <button onClick = {() => this.setState({editable: true})}>Edit</button>
                            : <p></p>
                        }
                        
                        <p>{this.state.time}</p>
                        <p>{this.state.likes.length} like(s)</p>
                        {this.handleLikeButton()}
                    </div>
                }
            </div>

        )
    }

}

class Profile extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            clickedUsername: this.props.clickedUsername,
            currentUsername: '',
            posts: [],
            followers: [],//of the clicked username
            followings: [] //of the clicked username
        };
    }

    async unfollow(clickedUsername){//current user is unfollowing the clicked username
        await fetch(`unfollow/${clickedUsername}`)
        .then(response => response.json())
        .then(message => {
            console.log(message);
        })
        this.componentDidMount();
    }

    async follow(clickedUsername){
        await fetch(`follow/${clickedUsername}`)
        .then(response => response.json())
        .then(follow => {
            console.log(`${follow.follower} is now following ${follow.followee}`)
        });
        this.componentDidMount();
    }

    handleFollowButton(clickedUsername, currentUsername){
        if(clickedUsername == currentUsername){
            return;
        }

        //if current username if already following the clickedusername then put unfollow
        //check in the followers array if the current username is there, if its the case, return unfollow

        try{
            this.state.followers.forEach(follower => {//followers of clickedusername
                if(follower.username == this.state.currentUsername){
                    throw BreakException;
                }
            })
        }
        catch(e){
            return <button onClick = {() => {this.unfollow(this.state.clickedUsername)}}>Unfollow</button>
        }

        return <button onClick = {() => {this.follow(this.state.clickedUsername)}}>Follow</button>

    }

    async componentDidMount(){
        await fetch('/currentUser')
        .then(response => response.json())
        .then(user => {
            this.setState({
                currentUsername: user.username
            });
        });

        if(this.state.clickedUsername == '~'){
            this.setState({
                clickedUsername: this.state.currentUsername
            });
        }

        await fetch(`/userFollowers/${this.state.clickedUsername}`)
        .then(response => response.json())
        .then(followers => {
            this.setState({
                followers:followers
            });
        })

        await fetch(`/userFollowing/${this.state.clickedUsername}`)
        .then(response => response.json())
        .then(followings => {
            this.setState({
                followings: followings
            });
        })

        await fetch(`/userPosts/${this.state.clickedUsername}`)
        .then(response => response.json())
        .then(posts => {
            this.setState({
                posts: posts
            });
        });

    }

    
    render(){
        return(
            <div>
                <div>
                    <h3>{this.state.clickedUsername}</h3>
                    <p>Followers: {this.state.followers.length} / Following: {this.state.followings.length}</p>
                    {this.handleFollowButton(this.state.clickedUsername, this.state.currentUsername)}
                </div>

                <div>
                    {this.state.posts.map(post =>
                        
                       <Post 
                            id = {post.id}
                            currentUsername = {this.state.currentUsername}
                            owner = {post.owner}
                            content = {post.content}
                            time = {post.time}
                            likes = {post.likes}
                            /> 
                        
                        )}
                </div>
            </div>
        )
    }
}

class Following extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentUsername: '',
            posts: []
        }
    }

    async componentDidMount(){

        await fetch('/currentUser')
        .then(response => response.json())
        .then(user => {
            this.setState({
                currentUsername: user.username
            });
        });

        await fetch(`/followingsPosts`)
        .then(response => response.json())
        .then(posts => {
            this.setState({
                posts: posts
            });
        })
    }

    render(){
        return (
            <div className = "followings-list">
                {this.state.posts.map(post => 
                    
                    <Post 
                        id = {post.id}
                        currentUsername = {this.state.currentUsername}
                        owner = {post.owner}
                        content = {post.content}
                        time = {post.time}
                        likes = {post.likes}
                        />
                   
                    )}
            </div>
        )
    }
}

ReactDOM.render(<AllPosts />, document.querySelector('#container'));

//render others when clicked
document.querySelector('#all-posts').addEventListener('click', () => {
    ReactDOM.render(<AllPosts />, document.querySelector('#container'));
})

document.querySelector('#newPost').addEventListener('click', () => {
    ReactDOM.render(<PostForm />, document.querySelector('#container'));
})

document.querySelector('#profile').addEventListener('click', () => {
    ReactDOM.render(<Profile clickedUsername = "~" />, document.querySelector('#container'));
})

document.querySelector('#following').addEventListener('click', () => {
    ReactDOM.render(<Following />, document.querySelector('#container'));
})

document.querySelector('DOMContentLoaded', function (){
    console.log('Hello');
});