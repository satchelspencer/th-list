define(['css!./list.css', 'jquery-plugins'], {
	name : 'list',
	html : "<div class='list'></div>",
	init : function(view, options){
		var _ = require('underscore');
		var $ = require('jquery');

		var group = options.group||options;
		var item = options.item||"<div class='listItem'>";
		var getItemFn = item;
		if(!_.isFunction(getItemFn)) getItem = function(model){
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

		function getItem(model){
			var el = getItemFn(model);
			var dragging = false;
			if(options.draggable) el.on('mousedown', function(e){
				var clone = el.clone()
					.addClass('clone')
					.width(el.width())
					.height(el.height());
				clone.copyCSS(el);
				clone.css({
					position : 'absolute',
					margin : 0,
					pointerEvents : 'none',
					opacity : 0,
					zIndex : '199999999299',
					transition : '0.5s opacity'
				})
				clone.find('*').css({pointerEvents : 'none'});
				$('body').append(clone).addClass('unselectable dragging');
				$('body').on('mousemove', function(me){
					var d = diff(e, me);
					n = d.dist > 10;
					if(!dragging && n){
						el.triggerHandler('dragstart');
						el.css({pointerEvents : 'none'});
					}else if(dragging && !n){
						el.triggerHandler('dragcancel');
						el.css({pointerEvents : 'all'});
					}
					dragging = n;
					if(dragging){
						clone.css({
							top : me.clientY-e.offsetY,
							left : me.clientX-e.offsetX,
							opacity : 0.7
						});
					}else clone.css({opacity : 0});
				});
				$('body').on('mouseover', function(mouseover){
					$(mouseover.target).triggerHandler('dragover');
				});
				$('body').on('mouseup', function(endev){
					endev.preventDefault();
					endev.stopPropagation();
					el.css({pointerEvents : 'all'});
					$('body').off('mousemove mouseup mouseover').removeClass('unselectable');
					if(dragging){
						var res;
						$(endev.target).trigger('drop', function(arg){
							if(!res){ //only take the first responder
								el.trigger('dropped', arguments);
								res = true;
							}
						});
						setTimeout(function(){
							dragging = false;
							if(!res) el.triggerHandler('dragcancel');
						}, 100)
					}
					clone.remove();
					return false;
				});
			})
			return el;
		}

		group.on('include', function(model, i){
			var el = $(getItem(model, i)).addClass(model._id);
			if(options.norewrite) el.triggerHandler('update', model);
			el.insertAt(i, view);
		})
		group.on('update', function(model, i){
			if(options.norewrite){
				view.find('.'+model._id).triggerHandler('update', model);
			}else{
				var el = $(getItem(model, i)).addClass(model._id);
				view.find('.'+model._id).insertAt(i, view).replaceWith(el);
			}
		})
		group.on('exclude', function(model){
			view.find('.'+model).remove();
		})			
	}
})