//公用方法调用


yx.public.navFn();
yx.public.backUpFn();


//产品页面就是根据网址进行获取数据(window.location.href)
var params=yx.parseUrl(window.location.href);
console.log(params);
var pageId=params.id;                           //产品对应的ID：1143021、1092014、1113019
var curData=productList[pageId];                //产品对应的数据

/*if(!pageId || !curData){
    //这个就是404页面出现的条件
    window.location.href='404.html';
}else{
    window.location.href='product.html';
}*/

//console.log(productList);
//面包屑功能
var positionFn=yx.g('#position');
positionFn.innerHTML='<a href="#" class="first">首页</a> >';
for(var i=0;i<curData.categoryList.length;i++){
    positionFn.innerHTML+='<a href="#">'+curData.categoryList[i].name+'</a> >';
};
positionFn.innerHTML+=curData.name;


//产品图切换
(function(){
    var bigImg=yx.g('#productImg .left img');
    var smallImg=yx.ga('#productImg .smallImg img');

    bigImg.src=smallImg[0].src=curData.primaryPicUrl;
    var last=smallImg[0];

    for(var i=0;i<smallImg.length;i++){
        if(i){
            //这个条件满足，说明现在是后面四张图片
            smallImg[i].src=curData.itemDetail['picUrl'+i];
        };
        smallImg[i].index=i;
        smallImg[i].onmouseover=function(){
            bigImg.src=this.src;
            last.className='';
            this.className='active';
            last=this;
        }
    };

    //右边信息列表更换
    yx.g('#productImg .info h2').innerHTML=curData.name;
    yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
    yx.g('#productImg .info .price').innerHTML=`
         <div><span>售价</span><strong>${'￥'+curData.retailPrice+'.00'}</strong></div>
         <div>
            <span>促销</span>
            <a href="${curData.hdrkDetailVOList[0].huodongUrlPc}" class="tag">
                ${curData.hdrkDetailVOList[0].activityType}
            </a>
            <a href="#" class="discount">
                ${curData.hdrkDetailVOList[0].name}
            </a>
         </div>
         <div>
            <span>服务</span>
            <a href="#" class="service">
                <i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元包邮费<i></i>网易自营品牌
            </a>
         </div>
    `;

    //创建规格DOM
    var format=yx.g('#productImg .format');
    var dds=[];                     //把所有的dd标签存起来，为了后面要使用；
    var	maxNum=0;

    for(var i=0;i<curData.skuSpecList.length;i++){
        var dl=document.createElement('dl');
        var dt=document.createElement('dt');
        dt.innerHTML=curData.skuSpecList[i].name;
        dl.appendChild(dt);

        for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
            var	dd=document.createElement('dd');
            dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
            dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id);

            dd.onclick=function(){
                changeProduct.call(this);
            };
            dds.push(dd);
            dl.appendChild(dd);
        }

        dl.className='clearfix';
        format.appendChild(dl);
    };

    //点击规格功能
    function changeProduct(){
        //如果不能点击的话就返回
        if(this.className.indexOf('noclick') != -1){
            return;
        }
        var curId=this.getAttribute('data-id');  //当前点击的dd元素身上的id；
        var othersDd=[];                         //对方所有的dd元素；
        var mergeId=[];                          //与当前点击的dd身上的id组合到的所有id组成匹配对象中的key(进行匹配查询)

        //找对方的dd元素以及组合后的id，数据匹配对象中的key是：'点击的id;对方的id';
        for(var attr in curData.skuMap){
            if(attr.indexOf(curId)!=-1){
                //这个条件成立，说明在数据里找到了当前点击的那个id能够组合的所有id
                var otherId=attr.replace(curId,'').replace(';','');

                //通过对方的id找到对方的dd；
                for(var i=0;i<dds.length;i++){
                    if(dds[i].getAttribute('data-id')==otherId){
                        othersDd.push(dds[i]);
                    }
                };
                mergeId.push(attr);
            }
        }

        //点击时的功能分析：
        /*
         *	1、自己是未选中状态
         * 		1、兄弟节点
         * 			有选中的话要取消选中，有不能点击的不要处理；
         * 		2、自己选择
         * 		3、对方节点
         * 			先去掉有noclick的class的元素，再给不能点击的加上noclick
         *
         * 	2、自己是选中状态
         * 		1、取消自己选中
         * 			(兄弟节点不用处理)
         * 		2、对方节点
         * 			如果有不能点击的要去掉noclick的class
         *
         */

        //当前点击的兄弟节点
        var	brothers=this.parentNode.querySelectorAll('dd');

        if(this.className=='active'){
            //当前点击的元素被选中
            this.className='';
            for(var i=0;i<othersDd.length;i++){
                if(othersDd[i].className=='noclick'){
                    othersDd[i].className='';
                }
            }
        }else{
            //当前点击的元素位被选中
            for(var i=0;i<brothers.length;i++){
                if(brothers[i].className=='active'){
                    brothers[i].className='';
                }
            };
            this.className='active';
            for(var i=0;i<othersDd.length;i++){
                if(othersDd[i].className=='noclick'){
                    othersDd[i].className='';
                }

                if(curData.skuMap[mergeId[i]].sellVolume==0){
                    othersDd[i].className='noclick';
                }
                maxNum=Math.max(curData.skuMap[mergeId[i]].sellVolume,50);
            }
        }
        addNum();
    };

    //加减功能
    function addNum(){
        var actives=yx.ga('#productImg .format dd.active');
        var	btnParent=yx.g('#productImg .number div');
        var	btns=btnParent.children;

        //用户能够选择的规格的数量；
        var ln=curData.skuSpecList.length;

        //是否打开加减功能
        if(actives.length>=ln){
            btnParent.className='';
        }else{
            btnParent.className='noClick';
        };

        //减号点击
        btns[0].onclick=function(){
            if(btnParent.className){
                return;
            }
            btns[1].value--;
            if(btns[1].value<0){
                btns[1].value=0;
            }
        };

        //input点击
        btns[1].onfocus=function(){
            //这个条件成立说明父级是不能点击的，就需要让输入框失去焦点；
            if(btnParent.className){
                btns[1].blur();
            }
        };

        //加号点击
        btns[2].onclick=function(){
            if(btnParent.className){
                return;
            }
            btns[1].value++;
            if(btns[1].value>maxNum){
                btns[1].value=maxNum;
            }
        }
    }
})();


//大家都在看功能
(function(){
    var ul=yx.g('#look ul');
    var str='';

    for(var i=0;i<recommendData.length;i++){
        str+='<li>'+
            '<a href="#" class="scaleImg"><img src="'+recommendData[i].listPicUrl+'" alt="" /></a>'+
            '<a href="#">'+recommendData[i].name+'</a>'+
            '<span>'+recommendData[i].retailPrice+'</span>'+
            '</li>';
    }
    ul.innerHTML=str;

    //引入组件
    var	allLook=new	Carousel();
    allLook.init({
        id:'allLook',
        autoplay:false,
        intervalTime:1000,
        loop:false,
        totalNum:8,
        moveNum:1,
        circle:false,
        moveWay:'position'
    });
})();


//详情功能
(function(){
    //详情与评价选项卡
    var as=yx.ga('#bottom .title a:not(.third)');
    var tabs=yx.ga('#bottom .content>div');
    var ln=0;

    for(var i=0;i<as.length;i++){
        as[i].index=i;
        as[i].onclick=function(){
            as[ln].className='';
            tabs[ln].style.display='none';
            this.className='active';
            tabs[this.index].style.display='block';

            ln=this.index;
        }
    };

    //详情内容产品参数
    var tbody=yx.g('.detail tbody');

    for(var i=0;i<curData.attrList.length;i++){
        //curData.attrList是一个数组，里面的每一项是一个对象；
        //根据数组的长度来创建tr/td的个数；

        if(i%2==0){
            var tr=document.createElement('tr');
        }

        var td1=document.createElement('td');
        td1.innerHTML=curData.attrList[i].attrName;
        var td2=document.createElement('td');
        td2.innerHTML=curData.attrList[i].attrValue;
        tr.appendChild(td1);
        tr.appendChild(td2);

        tbody.appendChild(tr);
    };

    //详情图片列表
    var img=yx.g('.detail .img');
    img.innerHTML=curData.itemDetail.detailHtml;
})();


//评价功能
(function(){
    console.log(commentData);

    //修改评价数量
    var evaluateNum=commentData[pageId].data.result.length;
    var evaluateText=evaluateNum>1000?'999+':evaluateNum;
    yx.ga('#bottom .title span').innerHTML='（'+evaluateText+'）';

    //全部与有图选项卡
    var allData=[[],[]];    //第一个代表全部评价，第二个代表有图的评价
    for(var i=0;i<evaluateNum;i++){
        allData[0].push(commentData[pageId].data.result[i]);

        if(commentData[pageId].data.result[i].picList.length){
            allData[1].push(commentData[pageId].data.result[i]);
        }
    };

    var allNum=yx.ga('#bottom .eTitle span');
    allNum[0].innerHTML='全部（'+allData[0].length+'）';
    allNum[1].innerHTML='有图（'+allData[1].length+'）';

    var curData=allData[0];         //代表当前显示的那个数据

    var btns=yx.ga('#bottom .eTitle div');
    var ln=0;

    for(var i=0;i<btns.length;i++){
        btns[i].index=i;
        btns[i].onclick=function(){
            btns[ln].className='';
            this.className='active';
            ln=this.index;
            curData=allData[this.index];
            showComment(10,0);
            createPage(10,curData.length);          //生成页码

        };
    }



    //显示评价数据
    showComment(10,0);
    function showComment(pn,cn){
        /*
         *      pn表示一页显示几条
         *      cn表示现在是那一页
         */
        var ul=yx.g('#bottom .border>ul');
        var dataStart=pn*cn;            //数据起始的值
        var dataEnd=dataStart+pn;       //数据结束的值

        //如果结束的值大于了数据的总量，循环的时候就会报错，所以要把结束的值改成数量总量；
        if(dataEnd>curData.length){
            dataEnd=curData.length;
        };


        //主体结构
        var str='';
        ul.innerHTML='';
        for(var i=dataStart;i<dataEnd;i++){

            //判断是否有用户图像
            var avatart=curData[i].frontUserAvatar?
                curData[i].frontUserAvatar:'images/avatar.png';

            //判断是否需要轮播图和小图
            var smallImg='';
            var dialogo='';
            if(curData[i].picList.length){

                //这个条件满足说明需要创建小图和轮播图
                var span='';
                var li='';
                for(var j=0;j<curData[i].picList.length;j++){
                    span+='<span><img src="'+curData[i].picList[j]+'" alt=""></span>';
                    li+='<li><img src="'+curData[i].picList[j]+'" alt=""></li>';
                }
                smallImg='<div class="smallImg clearfix">'+span+'</div>';
                dialogo='<div class="dialog" id="commentImg'+i+
                            '"data-imgNum="'+curData[i].picList.length+'">'+
                            '<div class="carouselImgCon">'+
                                '<ul>' +li+'</ul>'+
                            '</div>'+
                            '<div class="close">X</div>'+
                        '</div>';
            }

            str+='<li>'+
                    '<div class="avatar">'+
                        '<img src="'+avatart+'" alt="">'+
                        '<a href="#" class="vip1"></a>' +
                        '<span>'+curData[i].frontUserName+'</span>'+
                     '</div>' +
                     '<div class="text">' +
                        '<p>'+curData[i].content+'</p>' +smallImg+
                        '<div class="color clearfix">'+
                            '<span class="left">'+curData[i].skuInfo+'</span>'+
                            '<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+
                        '</div>' +dialogo+
                     '</div>'+
                 '</li>';
        };

        ul.innerHTML=str;
        showImg();
    };


    //调用轮播图组件
    function showImg(){
        var spans=yx.ga('#bottom .smallImg span');
        for(var i=0;i<spans.length;i++){
            spans[i].onclick=function(){
                var dialog=this.parentNode.parentNode.lastElementChild;
                dialog.style.opacity=1;
                dialog.style.height='510px';

                var en=0;
                dialog.addEventListener('transitionend',function(){
                    en++;
                    if(en==1){
                        var id=this.id;
                        var commentImg=new Carousel();
                        commentImg.init({
                            id:id,
                            totalNum:dialog.getAttribute('data-imgNum'),
                            autoplay:false,
                            loop:true,
                            moveNum:1,
                            intervalTime:600,
                            circle:false,
                            moveWay:'position'
                        })
                    }
                });

                var	closeBtn=dialog.querySelector('.close');
                closeBtn.onclick=function(){
                    dialog.style.opacity=0;
                    dialog.style.height=0;
                }
            }
        }
    };

    createPage(10,curData.length);

    //翻页功能
    function createPage(pn,tn){
        //pn            显示页码的数量
        //tn            数据的总数

        var page=yx.g('.page');
        var totalNum=Math.ceil(tn/pn);          //最多能显示的页码数量

        //如果用户给的页数比总页数还要大，就改成总数
        if(pn>totalNum){
            pn=totalNum;
        };
        page.innerHTML='';

        var cn=0;           //当前点击页码的索引
        var spans=[];       //把数字的页码都放在一个数组里，其他的地方要用到；
        var div=document.createElement('div');
        div.className='mainPage';

        //创建"首页"页码
        var indexPage=pageFn('首页',function(){
            for(var i=0;i<pn;i++){
                spans[i].innerHTML=i+1;
            }
            cn=0;
            changePage();
            showComment(10,spans[0].innerHTML-1);
        });

        //如果页码的数量小于2，返回值indexPage是undefined；
        if(indexPage){
            indexPage.style.display='none';
        }

        //创建"上一页"页码
        var prevPage=pageFn('< 上一页',function(){
            cn--;
            if(cn<0){
                cn=0;
            }
            changePage();
            showComment(10,spans[cn].innerHTML-1);
        });

        //如果页码的数量小于2，返回值indexPage是undefined；
        if(prevPage){
            prevPage.style.display='none';
        }

        //创建"数字"页码
        for(var i=0;i<pn;i++){
            var span=document.createElement('span');
            span.index=i;
            span.innerHTML=i+1;
            spans.push(span);

            //给第一个页码
            span.className=i?'':'active';
            span.onclick=function(){
                cn=this.index;
                showComment(10,this.innerHTML-1);
                changePage();
            };

            //将span添加到div.mainPage中；
            div.appendChild(span);
        }
        if(totalNum!=1){
            page.appendChild(div);
        };



        //创建"下一页"页码
        var nextPage=pageFn('下一页 >',function(){
            cn++;
            if(cn>spans.length-1){
                cn=spans.length-1;
            }
            changePage();
            showComment(10,spans[cn].innerHTML-1);
        });

        //创建"尾页"页码
        var endPage=pageFn('尾页',function(){
            var end=totalNum;
            for(var i=pn-1;i>=0;i--){
                spans[i].innerHTML=end--;
            }
            cn=spans.length-1;
            showComment(10,totalNum-1);
            changePage();
        });

        changePage();
        //changePage函数(更新页码功能)
        function changePage(next){

            var cur=spans[cn];          //当前点击的那个数字页码
            var curInner=cur.innerHTML; //存一下当前的页码，因为后面会被修改；

            //拿最后的页码数字减去第一个页码的数字算出来的差，就是页码要增加或者减少的数量，同时保证点击的那个
            //页码会出现在更新后的页码里面；
            var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;

            //点击的是最后面的页码(页码要增加)
            if(cur.index==spans.length-1){
                if(Number(curInner)+differ>totalNum){
                    differ=totalNum-curInner;
                }
            }

            //点击的是最前面的页码(页码要减少)
            if(cur.index==0){
                if(curInner-differ<1){
                    //如果减去差值的页码比1还小，说明左边已经到头了，那就让页码从1开始
                    differ=curInner-1;
                }
            }


            for(var i=0;i<spans.length;i++){
                //点击的是最后面的页码，所有的页码都需要增加
                if(cur.index==spans.length-1){
                    spans[i].innerHTML=Number(spans[i].innerHTML)+differ;
                }

                //点击的是最前面的页码，所有的页码都需要减少
                if(cur.index==0){
                    spans[i].innerHTML=spans[i].innerHTML-differ;
                }


                //设置active的类名
                spans[i].className='';
                if(spans[i].innerHTML==curInner){
                    spans[i].className='active';
                    cn=spans[i].index;
                }

                //显示与隐藏功能页码
                if(pn>1){
                    //点的是第一个页码，就让首页和第一页隐藏
                    var dis=curInner==1?'none':'inline-block';
                    indexPage.style.display=dis;
                    prevPage.style.display=dis;

                    //点击的是最后一个页码，就让尾页和下一页隐藏；
                    var disAnd=curInner==totalNum?'none':'inline-block';
                    nextPage.style.display=disAnd;
                    endPage.style.display=disAnd;
                }
            }
        };

        //创建页码的公用函数(功能性的页码：上一页、下一页这类的)
        function pageFn(inner,fn){
            //inner         创建元素的innerHTML
            //fn            元素的事件函数
            if(pn<2){
                return;
            }

            var span=document.createElement('span');
            span.innerHTML=inner;
            span.onclick=fn;
            page.appendChild(span);

            return span;            //把创建的标签返回出去，在瓦面可以使用；
        };

    }

})();

//加入购物车功能
(function(){
    yx.public.shopFn();


    var joinBtn=yx.g('#productImg .enter');             //加入购物车按钮


    joinBtn.onclick=function(){
        var actives=yx.ga('#productImg .format .active');       //选中规格的数量
        var selectNum=yx.g('#productImg .number input').value;  //用户选中的产品个数
        if(actives.length<curData.skuSpecList.length || selectNum<1){
            alert('请选择正确的规格和数量');
            return;
        };

        var id='';                  //用选中规格参数作为id；
        var spec=[];                //这个对象存放的是选中产品的规格

        for(var i=0;i<actives.length;i++){
            id+=actives[i].getAttribute('data-id')+';';
            spec.push(actives[i].innerHTML);
        }
        id=id.substring(0,id.length-1);

        var select={
            "id":id,
            "name":curData.name,
            "price":curData.retailPrice,
            "number":selectNum,
            "img":curData.skuMap[id].picUrl,
            "spec":spec,
            "sign":"productLocal"           //给自己的local取一个标识，避免取到其他人的local
        };

        //把声明的对象存到localStorage里面；用到JSON数据格式，因为localStorage参进去的是字符串；
        localStorage.setItem(id,JSON.stringify(select));

        //点击的时候也是需要刷新购物车
        yx.public.shopFn();

        //添加商品时需要弹出购物车
        var cartWrap=yx.g('.cartWrap');
        cartWrap.onmouseenter();
        setTimeout(function(){
            yx.g('.cart').style.display='none';
        },2000);
    }

})();





