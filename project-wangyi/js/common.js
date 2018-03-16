window.yx={
    g:function(name){
        return document.querySelector(name);
    },
    ga:function(name){
        return document.querySelectorAll(name);
    },
    addEvent:function(obj,ev,fn){
        if(obj.addEventListener){
            obj.addEventListener(ev,fn);
        }else{
            obj.attachEvent('on'+ev,fn);
        }
    },
    removeEvent:function(obj,ev,fn){
        if(obj.removeEventListener){
            obj.removeEventListener(ev,fn);
        }else{
            obj.detachEvent('on'+ev,fn);
        }
    },

    //获取元素到HTML头部的距离
    getTopValue:function(obj){
        var dis=0;
        while(obj.offsetParent){
            dis+=obj.offsetTop;
            obj=obj.offsetParent;
        }
        return dis;
    },

    //倒计时
    cutTime:function(target){
      var currentDate=new Date();               //获取当前时间
      var v=Math.abs(target-currentDate);       //传进来的时间与现在的时间之间的差(毫秒数)

      return {                                  //把毫秒转成对应的天、时、分、秒
          d:parseInt(v/(24*3600000)),
          h:parseInt(v%(24*3600000)/3600000),
          m:parseInt(v%(24*3600000)%3600000/60000),
          s:parseInt(v%(24*3600000)%3600000%60000/1000)
        }
    },

    //添加补零
    format:function(v){
        return	v<10?'0'+v:v;
    },

    //正则解析URL
    parseUrl:function(url){                     //把url后面的参数解析成一个对象(id=1143021)
        var reg=/(\w+)=(\w+)/ig;
        var result={};

        url.replace(reg,function($0,$1,$2){
            result[$1]=$2;
        });

        return result;
    },

    //时间分割
    formatDate:function(time){
        var d=new Date(time);
        return  d.getFullYear()+'-'+
                yx.format(d.getMonth()+1)+'-'+
                yx.format(d.getDate())+'  '+
                yx.format(d.getHours())+':'+
                yx.format(d.getMinutes());
    },

    public:{
        navFn:function(){
            var nav=yx.g('.nav');
            var lis=yx.ga('.navBar li');
            var subNav=yx.g('.subNav');
            var uls=yx.ga('.subNav ul');
            var newLis=[];          //存储实际有用的li

            //首页是没有hover状态，所以要从1开始循环；
            for(var i=1;i<lis.length-3;i++){
                newLis.push(lis[i]);
            }

            for(var i=0;i<newLis.length;i++){
                newLis[i].index=uls[i].index=i;
                newLis[i].onmouseenter=uls[i].onmouseenter=function(){
                    this.className='active';
                    subNav.style.opacity=1;
                    uls[this.index].style.display='block';
                };

                newLis[i].onmouseleave=uls[i].onmouseleave=function(){
                    this.className='';
                    subNav.style.opacity=0;
                    uls[this.index].style.display='none';
                }
            }

            //添加滚动条事件
            yx.addEvent(window,'scroll',serNavPos);


            function serNavPos(){
                if(window.pageYOffset>nav.offsetTop){
                    nav.id="navFix";
                }else{
                    nav.id='';
                }
            }
        },

        //图片懒加载功能，将src先放一张空图片的地址，当这张图片出现在可视区里，再把真实的地址赋值给img的src
        lazyImgFn:function(){
            yx.addEvent(window,'scroll',delayImg);
            function delayImg(){
                var originals=yx.ga('.original');
                var scrollTop=window.innerHeight+window.pageYOffset;
                for(var i=0;i<originals.length;i++){
                    if(yx.getTopValue(originals[i])<scrollTop){
                        console.log(122);
                        //如果图片离html的上边的距离小于滚动条的距离与可视区的距离之和，就表示图片进入可视区
                        originals[i].src=originals[i].getAttribute('data-original');
                        originals[i].removeAttribute('class');
                    }
                }
                if(originals[originals.length-1].getAttribute('src')!=='images/empty.gif'){
                    //当这个条件成立,说明现在所有的图片的地址都已经换成真正的地址了，就取消事件；
                    yx.removeEvent(window,'scroll',delayImg);
                }
            }
        },

        //回顶部
        backUpFn:function(){
            var back=yx.g('.back');
            var timer;
            back.onclick=function(){
                var top=window.pageYOffset;
                timer=setInterval(function(){
                    top-=150;
                    if(top<=0){
                        top=0;
                        clearInterval(timer);
                    }
                    window.scrollTo(0,top);
                },16)
            }
        },

        //购物车功能
        shopFn:function(){

            /*
             *  localStorage：本地存储
             *      可以把数据存储在用户的浏览器缓存里面，相当于在用户的本地创建了一个数据库，存储对的形式是一个对象；
             *
             *      localStorage.setItem(key,value)			存储一条数据
             *      localStorage.getItem(key)				获取某条数据
             *      localStorage.removeItem(key)			删除某条数据
             *      localStorage.clear()					删除所有数据
             *      localStorage.length						获取数据的长度
             *      localStorage.key(i)						获取某条数据的key
             *
             *  localStorage的生命周期：只要不清除就会一直存在；
             *
             *  PS:     1、IE不支持本地操作，需要放在服务器环境下，尽量都在服务器环境下操作；
             *          2、如果设置的是重复的key，不会增加，而是修改已有的数据；
             */

            /*localStorage.setItem('kaivon','陈学辉');
            localStorage.setItem('qq','529644808');
            console.log(localStorage);
            console.log(localStorage.getItem('kaivon'));*/

            //购物车添加商品展示
            var productNum=0;                               //买了几件商品

            (function(local){
                var totalPrice=0;                           //商品合计
                var ul=yx.g('.cart .list ul');
                var li='';
                ul.innerHTML='';

                for(var i=0;i<local.length;i++){
                    var attr=local.key(i);                  //取到每一个key;
                    var value=JSON.parse(local[attr]);
                    //console.log(value);

                    if(value && value.sign=='productLocal'){
                        //这个条件成立说明现在拿到的local就是我们主动添加的local
                        li+=`
                            <li data-id="${value.id}">
                                    <a href="#" class="img"><img src="${value.img}" alt=""></a>
                                    <div class="message">
                                        <p>
                                            <a href="#">${value.name}</a>
                                        </p>
                                        <p>${value.spec.join(' ')+'X'+value.number}</p>
                                    </div>
                                    <div class="price">
                                        ${'￥'+value.price+'.00'}
                                    </div>
                                    <div class="close"></div>
                                </li>
                        `;

                        //商品总计
                        totalPrice+=parseFloat(value.price)*value.number;
                    }
                }
                ul.innerHTML=li;
                productNum=ul.children.length;
                yx.g('.cartWrap i').innerHTML=productNum;                       //更新商品数量
                yx.g('.cartWrap .total span').innerHTML='￥'+totalPrice+'.00';  //更新商品总价


                //删除商品功能
                var closeBtns=yx.ga('.cart .list .close');
                for(var i=0;i<closeBtns.length;i++){
                    closeBtns[i].onclick=function(){
                        localStorage.removeItem(this.parentNode.getAttribute('data-id'));
                        yx.public.shopFn();
                        if(ul.children.length==0){
                            yx.g('.cart').style.display='none';
                        }
                    }
                };

                //小红圈添加事件
                var cartWrap=yx.g('.cartWrap');
                var timer;          //为了解决购物车与弹出层之间的间隙会触发leave事件


                //只有当购物车里有内容的时候才需要给鼠标添加事件
                if(ul.children.length>0){
                    cartWrap.onmouseenter=function(){
                        clearTimeout(timer);
                        yx.g('.cart').style.display='block';
                        scrollFn();
                    };

                    cartWrap.onmouseleave=function(){
                        timer=setTimeout(function(){
                            yx.g('.cart').style.display='none';
                        },200);
                    };
                }else{
                    cartWrap.onmouseenter=null;
                }


            })(localStorage);





            //购物车的滚动条功能
            function scrollFn(){
                var contentWrap=yx.g('.cart .list');
                var content=yx.g('.cart .list ul');
                var scrollBar=yx.g('.cart .scrollBar');
                var slideWrap=yx.g('.cart .slideWrap');
                var slide=yx.g('.cart .slide');
                var btns=yx.ga('.cart .scrollBar span');
                var timer;

                //倍数
                var scaleNum=content.offsetHeight/contentWrap.offsetHeight;

                //设置滚动条显示与否
                if(scaleNum<=1){
                    scrollBar.style.display='none';
                }else{
                    scrollBar.style.display='block';
                }

                //给倍数一个最大值
                if(scaleNum>20){
                    scaleNum=20;
                }

                //内容与内容父级的长度之间的倍数与滑块与滑块父级的倍数是相反的；
                slide.style.height=slideWrap.offsetHeight/scaleNum+'px';

                //滑块拖拽
                var scrollTop=0;            //滚动条走的距离
                var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;    //滑块能够走的距离

                slide.onmousedown=function(ev){
                    var disY=ev.clientY-slide.offsetTop;

                    document.onmousemove=function(ev){
                        scrollTop=ev.clientY-disY;
                        scroll();
                    };

                    document.onmouseup=function(){
                        this.onmousemove=null;
                    };

                    ev.cancelBubble=true;
                    return false;
                };

                //滚动条的主体函数
                function scroll(){
                    if(scrollTop<0){
                        scrollTop=0;
                    }else if(scrollTop>maxHeight){
                        scrollTop=maxHeight;
                    }
                    var scaleY=scrollTop/maxHeight;
                    console.log(scaleY);
                    slide.style.top=scrollTop+'px';
                    content.style.top=-scaleY*(content.offsetHeight-contentWrap.offsetHeight)+'px';
                };

                //鼠标滚轮事件加给内容的父级
                myScroll(contentWrap,function(){
                    scrollTop-=10;
                    scroll();
                    clearInterval(timer);
                },function(){
                    scrollTop+=10;
                    scroll();
                    clearInterval(timer);
                });

                //鼠标滚轮事件
                function myScroll(obj,fnUp,fnDown){
                    obj.onmousewheel=fn;
                    obj.addEventListener('DOMMouseScroll',fn);

                    function fn(ev){
                        if(ev.wheelDelta>0 || ev.detail<0){
                            fnUp.call(obj);
                        }else{
                            fnDown.call(obj);
                        }

                        ev.preventDefault();
                        return false;
                    }
                };

                //上下箭头点击的功能
                for(var i=0;i<btns.length;i++){
                    btns[i].index=i;
                    btns[i].onmousedown=function(){
                        var n=this.index;
                        timer=setInterval(function(){
                            if(n){
                                scrollTop+=5;
                            }else{
                                scrollTop-=5;
                            }
                            scroll();
                            console.log(2222);
                        },16)
                    };

                    btns[i].onmouseup=function(){
                        clearInterval(timer);
                    }
                };

                //滑块区域点击的功能
                slideWrap.onmousedown=function(ev){
                    timer=setInterval(function(){
                        var slideTop=slide.getBoundingClientRect().top+slide.offsetHeight/2;

                        //这个条件成立说明现在鼠标在滑块的上面,滚动条应该往上走
                        if(ev.clientY<slideTop){
                            scrollTop-=5;
                        }else{
                            scrollTop+=5;
                        };

                        if(Math.abs(ev.clientY-slideTop)<=5){
                            clearInterval(timer);
                        }
                        scroll();
                    },16);
                };
                slideWrap.onmouseup=function(){
                    clearInterval(timer);
                }
            }
        }
    }
}