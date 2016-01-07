# preload
资源预加载组件

 - 队列，可以支持队列加载和回调，也可以加载视频或者音频
 - 进度条，可以动态获取进度条信息


##Install
    git clone https://github.com/jayZOU/preload.git
    npm install
 	npm run es6

 访问[http://localhost:8080/es6-demo](http://localhost:8080/es6-demo)
    


##Examples

```js
    /**
	*	Preload 资源预加载组件
	*	@author jayzou
	*	@time 2016-1-7
	*	@version 0.0.6
	*	@class Preload
	*	@param {object}	sources				必填  加载队列容器，支持队列加载以及加载一个队列后传入回调
	*	@param {booble}	isDebug				选填	是否开启Debug设置，可返回部分错误信息，默认false
	*	@param {object}	progress			选填	进度条容器，返回记载进度信息
	*	@param {object}	completeLoad		选填	完成所有加载项执行回调
	**/

    var preload = new Preload({
	    isDebug: true,
	    sources: {
	        imgs: {
	            source: [
	                "../public/image/b2.jpg",
	                "../public/image/b1.jpg"
	            ],
	            callback: function() {
	                console.log("队列1完成");
	            }
	        },
	        audio: {
	            source: [
	                "../public/audio/a.mp3",
	                "../public/audio/b.mp3"
	            ]
	        },
	        imgs2: {
	            source: [
	                "../public/image/b3.jpg",
	                "../public/image/b4.jpg",
	                "http://7xl041.com1.z0.glb.clouddn.com/OrthographicCamera.png",
	                "http://7xl041.com1.z0.glb.clouddn.com/audio.gif",
	            ],
	            callback: function() {
	                console.log("队列3完成");
	            }
	        }
	    },
	    // loadingOverTime: 3,
	    // loadingOverTimeCB: function(){
	    //     console.log("资源加载超时");
	    // },
	    // connector: {
	    //     int1: {
	    //         url: 'http://localhost/tcc/index.php?callback=read&city=上海市',
	    //         jsonp: true
	    //     },
	    //     int2: {
	    //         url: 'http://localhost/tcc/index.php?callback=read&city=深圳市',
	    //         jsonp: false,
	    //         callback: function(data){
	    //         	console.log(data);
	    //         }
	    //     }
	    // },
	    progress: function(completedCount, total) {
	        // console.log(total);
	        console.log(Math.floor((completedCount / total) * 100));
	    },
	    completeLoad: function() {
	        console.log("已完成所有加载项");
	    }
	});
```
##Notes

 - 队列名称不能重名，否则后面的队列会覆盖前面
 - ES6模式编写，队列之间同步加载，队列内资源为异步加载

	
	


  [1]: http://jayzou.coding.io/
  [2]: http://localhost:8080/