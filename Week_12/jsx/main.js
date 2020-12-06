
import {Component, createElement} from './framework.js'


class Carousel extends Component{
    constructor(){
        super()
        this.attributes = Object.create(null);
    }
    setAttribute(name,value){
        this.attributes[name] = value;
    }
    render(){
        // 保证我们拿到数据后再开始渲染
        console.log(this.attributes.src)
        // return document.createElement('div');
        this.root = document.createElement('div');
        this.root.classList.add('carousel')
        for(let record of this.attributes.src){
            // let child = document.createElement('img');
            // child.src = record;

            // 因为img可以拖拽，因此用div代替
            let child = document.createElement('div');
            child.style.background = `url('${record}')`;
            this.root.appendChild(child);

            // 轮播移动 方法一
            // let current = 0;
            // setInterval(() => {
            //     let children = this.root.children;
            //     ++current;
            //     current = current % children.length; //取余后可以到达长度后自动归回第一张
            //     for(let child of children){
            //         child.style.transform = `translateX(-${current * 100}%)`;
            //     }    
            // }, 3000);



            // 轮播移动 方法二
            /*let currentIndex = 0;
            setInterval(() => {
                let children = this.root.children;
                let nextIndex = (currentIndex + 1) % children.length; //取余后可以到达长度后自动归回第一张


                let current = children[currentIndex];
                let next = children[nextIndex];

                next.style.transition = "none";
                next.style.transform = `translateX(${100 - nextIndex * 100}%)`;


                setTimeout(() => {
                    next.style.transition = ''; //当前设置none失效，则css里面样式生效 
                    current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
                    next.style.transform = `translateX(${- nextIndex * 100}%)`;
                    currentIndex = nextIndex;   
                }, 16);//16毫秒刚好一帧
               

               
            }, 3000);*/

        };

        let position = 0

         // 手动播放
        this.root.addEventListener('mousedown', event =>{
            console.log('mousedown');
            let children = this.root.children;
            let startX = event.clientX , startY = event.clientY;

            let move = event =>{
                let x = event.clientX - startX;

                let current = position - ((x - x % 500) / 500);
                
                // for(let child of children){
                //     child.style.transition = 'none';
                //     child.style.transform = `translateX(${- position * 500 + x}px)`;
                // }

                for(let offset of [-1,0,1]){
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length;
                      
                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`
                }
            }

            let up = event =>{
                let x = event.clientX - startX;
                position = position - Math.round(x / 500); //拖动超过一半则按新位置,拖动不超过一半则0
                // for(let child of children){
                //     child.style.transition = '';
                //     child.style.transform = `translateX(${- position * 500 }px)`;
                // }
                // this.root.removeEventListener('mousemove',move);//移出的时候容易丢掉事件，因此移动到document监听
                // this.root.removeEventListener('mouseup',up);


                // Math.sign(Math.round(x / 500) - x) 移动方向

                for(let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]){
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length;
                      
                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 }px)`
                }

                document.removeEventListener('mousemove',move);
                document.removeEventListener('mouseup',up)
            }

            // this.root.addEventListener('mousemove',move);
            // this.root.addEventListener('mouseup',up);

            document.addEventListener('mousemove',move);
            document.addEventListener('mouseup',up)

            
        })

      
        return this.root 
    }
    mountTo(parent){
        parent.appendChild(this.render());
    }
}



// 轮播图
let d = [
    "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
    "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
    "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
    "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
]

let a = <Carousel src = {d}/>
// let a =<div>123123</div>

// document.body.appendChild(a)
a.mountTo(document.body);