
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API ROUTES
    path("sendPost", views.sendPost, name="sendPost"),
    path("allPosts", views.allPosts, name="allPosts"),
    path("currentUser", views.currentUser, name = "currentUser"),
    path("follow/<str:followee_name>", views.follow, name="follow"),
    path("unfollow/<str:followee_name>", views.unfollow, name="unfollow"),
    path("userFollowing/<str:name>", views.userFollowing, name="userFollowing"),
    path("userFollowers/<str:name>", views.userFollowers, name="userFollowers"),
    path("userPosts/<str:name>", views.userPosts, name="userPosts"),
    path("followingsPosts", views.followingsPosts, name="followingsPosts"),
    path("likePost/<int:post_id>", views.likePost, name="likePost"),
    path("unlikePost/<int:post_id>", views.unlikePost, name="unlikePost"),
    path("updatePost/<int:post_id>/<str:new_content>", views.updatePost, name="updatePost"),
    path("getNewContent/<int:post_id>", views.getNewContent, name = "getNewContent")
]
