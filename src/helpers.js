export function removeAllChild(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}


export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        alert('please provided file which is a png, jpg or jpeg image.');
        throw Error('provided file is not a png, jpg or jpeg image.');

    }
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}


export function fetchUserFeed(userToken,p,n){
    return fetch("http://localhost:5000/user/feed?p="+p+"&n="+n, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,// Your Authorization Token in the form ‘Token <AUTH_TOKEN>’
//http://localhost:5000/user/feed?p=0&n=500
        },
    });
}

export function FetchUserInfo(username,userToken){
    return fetch("http://127.0.0.1:5000/user/?username=" + username, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,
        },
    });
}



export function FetchInfoViaID(id, userToken){
    return fetch("http://localhost:5000/user/?id=" + id, {//id is query so it needs to be added here
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,
        },
    });
}


export function ReturnUserNameList(theList, userToken) {
    return new Promise ((resolve,reject) => {
        const Num = theList.length;
        const liker = [];
        for (let Index = 0; Index < Num; Index++) {
            const resultUserName = FetchInfoViaID(theList[Index], userToken)
            liker.push(resultUserName);
        }
        const resList = [];
        Promise.all(liker).then((values) => {
            // console.log(values);//返回的是promise的response
            Promise.all(values.map(value => value.json())).then((promiseResData) => {
                    for (let Index2 = 0; Index2 < promiseResData.length; Index2++) {
                        // console.log(promiseResData);//response具体的内容,有名有姓的
                        resList.push(promiseResData[Index2]["username"]);
                    }
                    resolve(resList)
                    reject("could not execute")
                }
            )
        });
    });
}
// to find the username of a list of id.

export function fetchPost(PostID, userToken){
    return fetch("http://localhost:5000/post/?id=" + PostID, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,
        }
        ,
    });
}




export function PUTUnlikePost(postId, userToken){
    return fetch("http://localhost:5000/post/unlike?id=" + postId, {

        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,
        },
    });
}


export function PUTlikePost(postId, userToken) {
    return fetch("http://localhost:5000/post/like?id=" + postId, {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Token " + userToken,
        },
    });

}



export function innerTextLikeOrNot(WhetherLike){
    let innerTextLike="♥︎Like It";
    if(WhetherLike){
        innerTextLike = "♡ Unlike It";
    }
    return innerTextLike
}




export const showProfile=(username,userToken,CurrentUserName)=>{
    const OldDiv=document.getElementById("postProfile");
    removeAllChild(OldDiv);
    const userName = username.innerText;

    document.getElementById("profile").style.display = "block";
    document.getElementById("closeProfile").onclick = function(){
        document.getElementById("profile").style.display = "none";
    }

    const Profilelist= document.getElementById("listProfile").childNodes;//


    const userinfo = FetchUserInfo(userName, userToken);
    userinfo.then(EachUserInfo => {
        const Title=document.getElementById("BigName");
        Title.innerText="username: "+userName;
        EachUserInfo.json().then(EachUserInfoData => {
            // console.log(EachUserInfoData);
            const name=document.createTextNode("name: "+ EachUserInfoData["name"]);
            Profilelist[3].replaceChild(name,Profilelist[3].childNodes[0]);

            const EmailInfo=document.createTextNode("Email Address: "+ EachUserInfoData["email"]);
            Profilelist[5].replaceChild(EmailInfo,Profilelist[5].childNodes[0]);

            const followingIdList=EachUserInfoData["following"];
            if(followingIdList.length>0){
                const HaveFollowingDiv= document.createElement("div");
                HaveFollowingDiv.innerText="Following:";
                HaveFollowingDiv.className="BoldPart";//

                const followPersonList=ReturnUserNameList(followingIdList,userToken)
                followPersonList.then(result=>{//promise.then have the result,otherwise it is empty
                    const followingDiv= document.createElement("div");
                    followingDiv.appendChild(HaveFollowingDiv);

                    for(let index=0;index<followingIdList.length;index++){
                        const EachFollowing=document.createElement("div");
                        EachFollowing.innerText=result[index];
                        followingDiv.appendChild(EachFollowing);
                        EachFollowing.addEventListener("click", function(){
                            showProfile(EachFollowing,userToken,CurrentUserName)
                        });
                    }
                    // console.log(followingDiv);
                    Profilelist[7].replaceChild(followingDiv,Profilelist[7].childNodes[0]);
                });



            }
            console.log(followingIdList.length);
            const numOfFollower=document.createTextNode("number of followers: "+ EachUserInfoData["followed_num"]);
            Profilelist[9].replaceChild(numOfFollower,Profilelist[9].childNodes[0]);






            //follow button
            const CurrentUserInfo=FetchUserInfo(CurrentUserName,userToken);
            CurrentUserInfo.then(currentData=>currentData.json().then(JCurrent=>{
                const CurrentUserFollowing=JCurrent["following"];
                const UsernameList=ReturnUserNameList(CurrentUserFollowing,userToken);
                UsernameList.then(CurrentUserFolResult=>{
                    const followDiv=document.getElementById("FollowPart");
                    console.log(userName);//userName is the profile's owner
                    console.log(CurrentUserName);//CurrentUserName is the user who login now
                    console.log(Title.innerText);
                    if(CurrentUserFolResult.includes(userName) && userName!==CurrentUserName){
                        removeAllChild(followDiv);
                        const UnfollowBTN=document.createElement("button");
                        UnfollowBTN.innerText="Unfollow This User."
                        UnfollowBTN.IdName="Unfollow";
                        UnfollowBTN.className="btn btn-secondary btn-sm";
                        followDiv.appendChild(UnfollowBTN);
                        UnfollowBTN.addEventListener("click", ()=>{
                            const FetchFollow=fetch("http://127.0.0.1:5000/user/unfollow?username=" + userName,{
                                method:"PUT",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json",
                                    "Authorization": "Token " + userToken,
                                },
                            });
                            window.location.reload();
                        });
                    }else if(!(CurrentUserFolResult.includes(userName)) && userName!==CurrentUserName){
                        removeAllChild(followDiv);
                        const followBTN=document.createElement("button");
                        followBTN.innerText="Follow This User."
                        followBTN.IdName="follow";
                        followBTN.className="btn btn-primary btn-sm";
                        followDiv.appendChild(followBTN);
                        //follow
                        followBTN.addEventListener("click", ()=>{
                            const FetchFollow=fetch("http://127.0.0.1:5000/user/follow?username=" + userName,{
                                method:"PUT",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json",
                                    "Authorization": "Token " + userToken,
                                },
                            });
                            window.location.reload();
                        });
                    }else if(userName===CurrentUserName){
                        removeAllChild(followDiv);}

                })
            }))










            const AllPosts = EachUserInfoData["posts"];
            const PostPromise = [];
            for (let PostIndex = 0; PostIndex < AllPosts.length; PostIndex++) {
                const PostID=AllPosts[PostIndex];
                const postResult=fetchPost(PostID, userToken);
                PostPromise.push(postResult);
            }
            Promise.all(PostPromise).then(postValue => {// console.log(postValue);
                Promise.all(postValue.map(ValuePO => ValuePO.json())).then(postPromiseResData => {
                    console.log(postPromiseResData);//return resultData
                    if (postPromiseResData.length > 0) {
                        removeAllChild(OldDiv);
                        for (let n = 0; n < postPromiseResData.length; n++) {//for each post!
                            const newDivPost = document.createElement("div");
                            newDivPost.className="newDivPostClass";
                            // newDivPost.setAttribute("id","post-box"+n);

                            const newDivImg = document.createElement("img");

                            const EachImg=postPromiseResData[n]['thumbnail'];
                            newDivImg.setAttribute("src", "data:image/png;base64, "+ EachImg );
                            newDivImg.className="img";
                            newDivPost.appendChild(newDivImg);

                            const newDescription=document.createElement("div");
                            newDescription.className="Describe";
                            newDescription.innerText=postPromiseResData[n]['meta']["description_text"];
                            newDivPost.append(newDescription);



                            const PostAuthorDiv=document.createElement("div");
                            PostAuthorDiv.className="PostAuthorDiv";

                            const PostAuthorNameDiv=document.createElement("div");
                            PostAuthorNameDiv.innerText=userName;

                            const PostTime = document.createElement("div");
                            const unix_timeStamp=postPromiseResData[n]['meta']['published'];
                            const date=new Date(unix_timeStamp*1000);
                            PostTime.innerText="At "+date.toLocaleString();

                            const AuthorTitle=document.createElement("div");
                            AuthorTitle.innerText="Posted by "
                            PostAuthorDiv.appendChild(AuthorTitle);
                            PostAuthorDiv.appendChild(PostAuthorNameDiv);
                            PostAuthorDiv.appendChild(PostTime);
                            newDivPost.appendChild(PostAuthorDiv);

                            PostAuthorNameDiv.addEventListener("click",function(){
                                showProfile(PostAuthorNameDiv,userToken,CurrentUserName);
                            });


                            //Comment part
                            CommentPartFunction(newDivPost,postPromiseResData,n,userToken,CurrentUserName);


                            //like part
                            LikePartFunction(postPromiseResData,n, newDivPost,userToken,CurrentUserName);

                            if(userName!==CurrentUserName){
                                //when current user is another people from the profile's owner
                                // console.log(userName);
                                // console.log(CurrentUserName);
                                OldDiv.appendChild(newDivPost);
                                //end
                                }else{//need to add edit post and delete post function
                                const EditPostButton=document.createElement("button");
                                EditPostButton.innerText="Edit This Post";
                                EditPostButton.addEventListener("click", ()=>{
                                    document.getElementById("EditPostScreen").style.display = "block";

                                    document.getElementById("closeEditAction").onclick=function(){
                                        document.getElementById("EditPostScreen").style.display = "none";
                                    }

                                    document.getElementById('PostNewStory').onclick=function(){
                                        const postID=postPromiseResData[n]["id"];
                                        const src=postPromiseResData[n]["thumbnail"];
                                        const EditPostBody={
                                            "description_text":document.getElementById("Update_description").value,
                                            "src":src,
                                        }
                                        const postUpdateFetch=fetch("http://127.0.0.1:5000/post/?id="+postID,{
                                                method:"PUT",
                                                headers:{
                                                    "Accept": "application/json",
                                                    "Content-Type": "application/json",
                                                    "Authorization": "Token " + userToken,
                                                },
                                                body: JSON.stringify(EditPostBody),
                                            }
                                        ).then(data=>{
                                            if(data.status===200){
                                                alert("You have updated your post successfully!, please refresh your page to see it.")
                                            }else if(data.status===403){
                                                alert("Invalid Auth Token / Unauthorized to edit Post")
                                            }else if(data.status===400){
                                                alert("Malformed Request")
                                            }else{throw new Error("Some error happened")}
                                            }).catch((error) => {
                                                console.log(error);

                                        })
                                        document.getElementById("EditPostScreen").style.display = "none";
                                        window.location.reload();
                                    }
                                })
                                newDivPost.append(EditPostButton);
                                const DeletePostButton=document.createElement("button");
                                DeletePostButton.innerText="Delete This Post";
                                DeletePostButton.addEventListener("click", ()=>{
                                    const DelPostID=postPromiseResData[n]["id"];
                                    const postDeleteFetch=fetch("http://127.0.0.1:5000/post/?id="+DelPostID,{
                                            method:"DELETE",
                                            headers:{
                                                "Accept": "application/json",
                                                "Content-Type": "application/json",
                                                "Authorization": "Token " + userToken,
                                            },
                                        }
                                    )
                                    alert("You have deleted your post successfully, please refresh your page ")
                                    window.location.reload()
                                })
                                newDivPost.append(DeletePostButton);
                                OldDiv.appendChild(newDivPost);
                            }
                        }
                    } else {
                        removeAllChild(OldDiv);
                        const noPostdiv=document.createElement("div");
                        noPostdiv.innerText="This user has no post."

                        OldDiv.appendChild(noPostdiv);
                    }
                })
            })
        })
    })
}

//
// export function LeaveCommentPart(newDivPost,userToken,CurrentUserName,newDivComment,LenOfComment, newDivCommentBlock,result,i){
//
//     const leaveComment=document.createElement("section");
//     newDivPost.appendChild(leaveComment);
//     // <input type="text" id="description_text" />
//     const content=document.createElement("input")
//     content.typeName="text";
//     leaveComment.appendChild(content);
//
//     const CommentBTN=document.createElement("button")
//     CommentBTN.innerText="Comment";
//     CommentBTN.className="btn btn-primary";
//
//     leaveComment.appendChild(CommentBTN);
//
//     CommentBTN.addEventListener("click", ()=>{
//         const commentBody={
//             "comment": content.value
//         }
//         const PUTComment = fetch("http://localhost:5000/post/comment/?id="+ result[i]["id"], {
//             method: "PUT",
//             headers: {
//                 "Accept": "application/json",
//                 "Content-Type": "application/json",
//                 "Authorization": "Token " + userToken,// Your Authorization Token in the form ‘Token <AUTH_TOKEN>’
//             },
//             body:JSON.stringify(commentBody),
//         }).then(data=>{
//             if(data.status===200) {
//                 alert("You have left your comment successfully!");
//
//
//                 const CommentAuthorDiv=document.createElement("div");
//                 CommentAuthorDiv.innerText=CurrentUserName;
//
//                 const commentDiv=document.createElement("div");
//                 commentDiv.innerText="comment: "+ content.value;
//
//                 newDivCommentBlock.appendChild(commentDiv);
//                 newDivCommentBlock.appendChild(CommentAuthorDiv);
//                 LenOfComment++;
//
//
//                 newDivComment.innerText="💬 "+LenOfComment+" comments";
//                 // newDivComment.className="badge bg-primary";
//
//             }else if(data.status===400){
//                 alert("Please input your comment.")
//
//             }else{throw new Error("Some error happened")}
//         }).catch((error) => {
//             console.log( error);
//         })
//     })
//
// }




export function LikePartFunction(ResData,n, newDivPost,userToken,CurrentUserName ){

    const IDArray= ResData[n]['meta']['likes'];
    const lenOflikers = IDArray.length;

    const LikePart=document.createElement("div");
    LikePart.className="LikePart";
    newDivPost.appendChild(LikePart);


    const LikeBTN = document.createElement("div");

    LikePart.appendChild(LikeBTN);


    const newDivLikDATA = document.createElement("h6");
    newDivLikDATA.className="NumberTitle";

    const likerListPart=document.createElement("div");
    LikePart.appendChild(likerListPart);

    // const likerTitle=document.createElement("div");
    // likerTitle.innerText="People like this post:";
    // likerListPart.appendChild(likerTitle);

    if(lenOflikers!==0) {
        // newDivLikDATA.className= "btn btn-primary";
        newDivLikDATA.innerText="😻 "+lenOflikers+ " Likes";
        LikePart.appendChild(newDivLikDATA);
        for (let NumlikerID=0; NumlikerID < lenOflikers; NumlikerID++){
            const thatID=IDArray[NumlikerID];
            // console.log(thatID);//thatID is the array, and the content in the 0th position is the first liker's id
            const resultGetliker = FetchInfoViaID(thatID, userToken)
            resultGetliker.then((dataUser)=>{dataUser.json().then( (userInfor)=>{
                const newDivLikers = document.createElement("div");
                newDivLikers.innerText=(userInfor["username"]);//注意createtextNode出来的str和变量代表的str是完全不一样的！！
                newDivLikers.setAttribute("class","likerNameClass");
                likerListPart.appendChild(newDivLikers);


                LikePart.appendChild(likerListPart);
                newDivLikers.addEventListener("click",()=> {
                        showProfile(newDivLikers,userToken,CurrentUserName);
                    }
                )
            })
            })

        }//likers's id for loop ends
    }else{
        newDivLikDATA.innerText="This post has not been liked yet";
        // newDivLikDATA.className= "btn btn-primary";
        LikePart.appendChild(newDivLikDATA);
    }




    const LikesListName=ReturnUserNameList(IDArray, userToken);
    const LikeOrNotBtn=document.createElement("button");
    LikeOrNotBtn.className="btn btn-primary";
    const postId = ResData[n]["id"];
    let WhetherLike = undefined;

    LikesListName.then(LikesListNameData=>{
        WhetherLike = !!LikesListNameData.includes(CurrentUserName);
        LikeOrNotBtn.innerText=innerTextLikeOrNot(WhetherLike);
        LikeBTN.replaceWith(LikeOrNotBtn);


        LikeOrNotBtn.addEventListener("click", ()=> {
            if (WhetherLike) {
                const unlikeACT = PUTUnlikePost(postId, userToken)
                unlikeACT.then(data => {
                    if (data.status === 200) {
                        WhetherLike=0;
                        LikeOrNotBtn.innerText = innerTextLikeOrNot(WhetherLike);
                        console.log(WhetherLike);
                    }else if(data.status === 403){
                        alert("Invalid Auth Token ")
                    }else if(data.status === 400){
                        alert("Malformed Request")
                    }else if(data.status === 404){
                        alert("Post Not Found")
                    }
                }).then(()=>{
                    const resultAgain=fetchPost(postId, userToken);
                    resultAgain.then((dataPostAgain) => {
                        if(dataPostAgain.status===200){
                            dataPostAgain.json().then((result2) => {
                                console.log(result2);
                                const brandLikers=result2.meta.likes;
                                if (brandLikers.length === 0) {
                                    newDivLikDATA.innerText="This post has not been liked yet";
                                    removeAllChild(likerListPart);
                                }else{//when list of liker>0
                                    newDivLikDATA.innerText="😻 "+brandLikers.length+" likes";
                                    // console.log(newDivPost.childNodes)
                                    console.log(likerListPart.childNodes);
                                    for(let i=0;i<likerListPart.childNodes.length;i++){

                                        if(likerListPart.childNodes[i].innerText===CurrentUserName){
                                            console.log(likerListPart.childNodes[i]);
                                            likerListPart.childNodes[i].remove();
                                        }
                                    }
                                }
                            })
                        }
                    })
                })
            }else{//我目前不喜欢此贴,显示的是like btn,我要点击我要喜欢他
                const likeACT = PUTlikePost(postId, userToken);
                //点完like，变成unlike
                likeACT.then(data2 => {
                    if (data2.status === 200) {
                        WhetherLike = 1;
                        LikeOrNotBtn.innerText = innerTextLikeOrNot(WhetherLike);
                        const resultAgain=fetchPost(postId, userToken);
                        resultAgain.then((dataPostAgain) => {
                            if(dataPostAgain.status===200){
                                dataPostAgain.json().then((result2) => {
                                    console.log(result2);
                                    const brandLikers=result2.meta.likes;
                                    if (brandLikers.length === 0) {
                                        newDivLikDATA.innerText="This post has not been liked yet";
                                        removeAllChild(likerListPart);
                                    }else{//when list of liker>0
                                        newDivLikDATA.innerText="😻 "+brandLikers.length+" likes";
                                        console.log(likerListPart.childNodes);
                                        const currentUserDiv=document.createElement("div");
                                        currentUserDiv.innerText=CurrentUserName;
                                        likerListPart.append(currentUserDiv);
                                        currentUserDiv.addEventListener("click",function(){
                                            showProfile(currentUserDiv,userToken,CurrentUserName);
                                        })
                                    }
                                })
                            }else{throw new Error("some error")}
                        }).catch(error=>{
                            console.log(error);
                        })
                    } else if(data2.status === 403){
                        alert("Invalid Auth Token ")
                    }else if(data2.status === 400){
                        alert("Malformed Request")
                    }else if(data2.status === 404){
                        alert("Post Not Found")
                    }
                })
            }
        })
    });
}




export function ReturnImg(result,i){
    const newDivImg = document.createElement("img");
    const EachImg=result['posts'][i]['src']
    newDivImg.className="img";

    newDivImg.setAttribute("src", "data:image/png;base64, "+ EachImg );
    newDivImg.setAttribute("width", "300");
    newDivImg.setAttribute("height", "300");
    return newDivImg;
}


export function ReturnAuthor(result,i){
    const newDivWho = document.createElement("div");
    newDivWho.innerText=result['posts'][i]['meta']['author'];
    // newDivWho.idName= "WhoPost"+i;
    return newDivWho;
}


export function ReturnPostTime(result,i){
    const newDivPostTime = document.createElement("div");
    const unix_timeStamp=result['posts'][i]['meta']['published'];
    const date=new Date(unix_timeStamp*1000);
    newDivPostTime.innerText="At "+date.toLocaleString();
    return newDivPostTime;
}




export function CommentPartFunction(newDivPost,result,i,userToken,CurrentUserName){
    const CommentPart=document.createElement("div");
    CommentPart.className="CommentPart";
    newDivPost.appendChild(CommentPart);



    const newDivComment = document.createElement("h6");
    newDivComment.className="NumberTitle";
    // const LenOfComment= resultFeed['posts'][i]['comments']["length"]
    let LenOfComment= result[i]['comments']["length"]
    newDivComment.innerText="💬 "+LenOfComment+" comments";
    CommentPart.appendChild(newDivComment);

    const newDivCommentBlock = document.createElement("div");
    newDivCommentBlock.ClassName="CommentBlock";
    CommentPart.appendChild(newDivCommentBlock);
    // console.log(newDivPost.childNodes);
    if (LenOfComment>0){
        for(let CommentsIndex=0; CommentsIndex< LenOfComment; CommentsIndex++){
            const CommentAuthorDiv=document.createElement("div");
            CommentAuthorDiv.innerText=result[i]['comments'][CommentsIndex]["author"];

            const commentDiv=document.createElement("div");
            commentDiv.innerText="comment : "+ result[i]['comments'][CommentsIndex]["comment"];


            newDivCommentBlock.appendChild(commentDiv);
            newDivCommentBlock.appendChild(CommentAuthorDiv);


            CommentAuthorDiv.addEventListener("click", function(){
                showProfile(CommentAuthorDiv,userToken,CurrentUserName);
            });
        }
    }
//leave a comment
    const leaveComment=document.createElement("section");
    CommentPart.appendChild(leaveComment);
    // <input type="text" id="description_text" />
    const content=document.createElement("input")
    content.typeName="text";
    leaveComment.appendChild(content);

    const CommentBTN=document.createElement("button")
    CommentBTN.innerText="Comment";
    CommentBTN.className="btn btn-primary";

    leaveComment.appendChild(CommentBTN);

    CommentBTN.addEventListener("click", ()=>{
        const commentBody={
            "comment": content.value
        }
        const PUTComment = fetch("http://localhost:5000/post/comment/?id="+ result[i]["id"], {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + userToken,// Your Authorization Token in the form ‘Token <AUTH_TOKEN>’
            },
            body:JSON.stringify(commentBody),
        }).then(data=>{
            if(data.status===200) {
                alert("You have left your comment successfully!");


                const CommentAuthorDiv=document.createElement("div");
                CommentAuthorDiv.innerText=CurrentUserName;

                const commentDiv=document.createElement("div");
                commentDiv.innerText=content.value;

                newDivCommentBlock.appendChild(commentDiv);
                newDivCommentBlock.appendChild(CommentAuthorDiv);
                CommentAuthorDiv.addEventListener("click",()=>{
                    showProfile(CommentAuthorDiv,userToken,CurrentUserName);
                })
                LenOfComment++;


                newDivComment.innerText="💬 "+LenOfComment+" comments";
                // newDivComment.className="badge bg-primary";

            }else if(data.status===400){
                alert("Please input your comment.")

            }else{throw new Error("Some error happened")}
        }).catch((error) => {
            console.log( error);
        })
    })

}
