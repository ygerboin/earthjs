// https://github.com/pyalot/webgl-heatmap
// https://github.com/pyalot/webgl-heatmap/blob/master/example.html
export default hmapUrl => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject:null,
        material: new THREE.MeshBasicMaterial({transparent:true})
    };
    const $ = {canvas: null};

    function init() {
        this._.options.showHmap = true;
        const SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        $.canvas = d3.select('body').append('canvas')
        .style('position','absolute')
        .style('display','none')
        .style('top','450px')
        .attr('id','webgl-hmap');
        _.canvas = $.canvas.node();
        _.heatmap = createWebGLHeatmap({
            intensityToAlpha:true,
            width: 1024,
            height: 512,
            canvas: _.canvas,
        });
        _.texture = new THREE.Texture(_.canvas);
        _.material.map = _.texture;

        if (!hmapUrl) {
            $.canvas.style('display','inherit');
            var paintAtCoord = function(x, y){
                var count = 0;
                while(count < 200){
                    var xoff = Math.random()*2-1;
                    var yoff = Math.random()*2-1;
                    var l = xoff*xoff + yoff*yoff;
                    if(l > 1){
                        continue;
                    }
                    var ls = Math.sqrt(l);
                    xoff/=ls; yoff/=ls;
                    xoff*=1-l; yoff*=1-l;
                    count += 1;
                    _.heatmap.addPoint(x+xoff*50, y+yoff*50, 30, 2/300);
                }
            }
            // event handling
            var onTouchMove = function(evt){
                evt.preventDefault();
                var touches = evt.changedTouches;
                for(var i=0; i<touches.length; i++){
                    var touch = touches[i];
                    paintAtCoord(touch.pageX, touch.pageY);
                }
            };
            _.canvas.addEventListener("touchmove", onTouchMove, false);
            _.canvas.onmousemove = function(event){
                var x = event.offsetX || event.clientX;
                var y = event.offsetY || event.clientY;
                paintAtCoord(x, y);

            }
            _.canvas.onclick = function(){
                _.heatmap.clear();
            }
        }
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.sphereObject.visible = this._.options.showHmap;
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function refresh() {
        _.heatmap.update();
        _.heatmap.display();
        _.sphereObject.visible = this._.options.showHmap;
    }

    return {
        name: 'hmapThreejs',
        urls: hmapUrl && [hmapUrl],
        onReady(err, data) {
            this.hmapThreejs.data(data);
        },
        onInit() {
            init.call(this);
        },
        onInterval() {
            if (!hmapUrl) {
                _.texture.needsUpdate = true;
            }
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}