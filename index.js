define(['css!./list.css'], {
	name : 'list',
	html : "<div class='list'></div>",
	init : function(view, options){
		var _ = require('underscore');
		var $ = require('jquery');

		/* insert element at index in parent */
		$.fn.insertAt = function(index, $parent) {
		    return this.each(function() {
		        if(index === 0) $parent.prepend(this);
		        else if(index < $parent.children().length-1){
		            var sel = this;
		            $parent.children().filter(function(){
		                return !$(this).is(sel);
		            }).eq(index - 1).after(this);
		        }else $parent.append(this);
		    });
		}

		$.fn.getStyleObject = function(){
		    var dom = this.get(0);
		    var style;
		    var returns = {};
		    if(window.getComputedStyle){
		        var camelize = function(a,b){
		            return b.toUpperCase();
		        };
		        style = window.getComputedStyle(dom, null);
		        for(var i = 0, l = style.length; i < l; i++){
		            var prop = style[i];
		            var camel = prop.replace(/\-([a-z])/g, camelize);
		            var val = style.getPropertyValue(prop);
		            returns[camel] = val;
		        };
		        return returns;
		    };
		    if(style = dom.currentStyle){
		        for(var prop in style){
		            returns[prop] = style[prop];
		        };
		        return returns;
		    };
		    return this.css();
		}

		$.fn.copyCSS = function(source){
		  var styles = $(source).getStyleObject();
		  this.css(styles);
		  var sc = source.children();
		  this.children().each(function(i){
		    $(this).copyCSS(sc.eq(i));
		  })
		}

		var group = options.group||options;
		var item = options.item||"<div class='listItem'>";
		var getItem = item;
		if(!_.isFunction(getItem)) getItem = function(model){
			return item;
		}

		function diff(a, b){
			var o = {
				x : a.clientX - b.clientX,
				y : a.clientY - b.clientY
			}
			o.dist = Math.sqrt(Math.pow(o.x, 2)+Math.pow(o.y, 2));
			return o;
		}

		group.on('include', function(model, i){
			if(model.name == 'some text') console.log(model, i);
			var el = $(getItem(model, i)).addClass(model._id);
			if(options.norewrite) el.triggerHandler('update', model);
			el.insertAt(i, view);
		})
		group.on('update', function(model, i){
			if(options.norewrite){
				view.children('.'+model._id).triggerHandler('update', model);
			}else{
				var el = $(getItem(model, i)).addClass(model._id);
				view.children('.'+model._id).insertAt(i, view).replaceWith(el);
			}
		})
		group.on('exclude', function(model){
			view.children('.'+model).remove();
		})			
	}
})