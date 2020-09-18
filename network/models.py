from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    def serialize(self):
        return {
            "id":self.id,
            "username":self.username
        }

    def __str__(self):
        return f"Username: {self.username}"


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete = models.CASCADE, related_name="posts")
    content = models.CharField(max_length=200)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post from {self.owner}"

    def serialize(self):
        return {
            "id": self.id,
            "owner":self.owner.username,
            "content":self.content,
            "time":self.time.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": [like.liker.username for like in self.likes.all()]
        }


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete = models.CASCADE, related_name="following")
    followee = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "followers")

    def __str__(self):
        return f"{self.follower.username} follows {self.followee.username}"

    def serialize(self):
        return {
            "follower":self.follower.username,
            "followee":self.followee.username
        }


class Like(models.Model):
    liker = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "likes")
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name = "likes")


    def __str__(self):
        return f"Post: {self.post.id} liked by {self.liker.username}"

    def serialize(self):
        return {
            "id":self.id,
            "liker":self.liker,
            "post":self.post
        }