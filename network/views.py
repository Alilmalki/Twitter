import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import datetime
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
def sendPost(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = data.get("content", "")

    post = Post(content = content, owner = request.user, time = datetime.datetime.now())

    post.save()

    return JsonResponse({"message": "Post Send Successfully"}, status=201)

    
def allPosts(request):

    posts = Post.objects.all()
    
    posts = posts.order_by("-time").all()

    return JsonResponse([post.serialize() for post in posts], safe = False)


def currentUser(request):
    user = request.user
    return JsonResponse(user.serialize())

def follow(request, followee_name):
    follower = request.user
    followee = User.objects.get(username=followee_name)
    follow = Follow(follower = follower, followee = followee)
    follow.save()
    return JsonResponse(follow.serialize())

def unfollow(request, followee_name):
    follower = request.user
    followee = User.objects.get(username = followee_name)
    Follow.objects.filter(follower = follower, followee = followee).delete()
    return JsonResponse({"message": "Unfollow was done successfully"}, status = 201)

def userFollowing(request, name):
    user = User.objects.get(username = name)
    follow_rows = Follow.objects.filter(follower = user)#get all the rows where the user is in the follower column

    followings = []

    for row in follow_rows:
        followings.append(row.followee)#user is following row.followee because the user is in the followers column

    return JsonResponse([following.serialize() for following in followings], safe = False)

def userFollowers(request, name):
    
    user = User.objects.get(username = name)

    follow_rows = Follow.objects.filter(followee = user)

    followers = []

    for row in follow_rows:
        followers.append(row.follower)

    return JsonResponse([follower.serialize() for follower in followers], safe = False)

def userPosts(request, name):
    user = User.objects.get(username=name)
    posts = user.posts.all()
    posts = posts.order_by("-time").all()
    return JsonResponse([post.serialize() for post in posts], safe = False)


def followingsPosts(request):
    user = request.user
    posts = []
    follow_rows = Follow.objects.filter(follower=user)

    for row in follow_rows:
        for post in row.followee.posts.all():
            posts.append(post)


    return JsonResponse([post.serialize() for post in posts], safe = False)

def likePost(request, post_id):
    liker = request.user
    post = Post.objects.get(id=post_id)
    like = Like(liker=liker, post=post)
    like.save()
    
    return JsonResponse(post.serialize())#to update the likes array in post app

def unlikePost(request, post_id):
    post = Post.objects.get(id=post_id)
    liker = request.user
    Like.objects.filter(liker = liker, post = post).delete()
    return JsonResponse(post.serialize())

def updatePost(request, post_id, new_content):
    post = Post.objects.get(id = post_id)
    post.content = new_content
    post.save()
    return JsonResponse({"message": "Updated"})

def getNewContent(request, post_id):
    post = Post.objects.get(id = post_id)
    return JsonResponse(post.serialize())
