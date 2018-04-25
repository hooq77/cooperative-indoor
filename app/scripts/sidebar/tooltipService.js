'use strict';

angular.module('CooperativeIndoorMap')
  .service('Tooltip', [
    function() {

      return {
        //html element of the tooltip
        tooltip: undefined,
        //mousemove function
        eventFunction: undefined,

        /**
         * 创建提示Tooltip
         */
        createTooltip: function() {
          if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tooltip-leafletstyle';
            var parentDiv = document.getElementsByTagName('body')[0];
            parentDiv.appendChild(this.tooltip);
          }
        },
        /**
         * 移除提示Tooltip
         */
        removeTooltip: function(){
          if(this.tooltip){
            var parentDiv = document.getElementsByTagName('body')[0];
            parentDiv.removeChild(this.tooltip);
          }
        },
        /**
         * 显示Tooltip
         * @param text tooltip中的文本
         */
        showTooltip: function(text) {
          if (!this.tooltip) {
            this.createTooltip();
          }
          this.updatePosition(this.tooltip);
          this.tooltip.innerHTML = text;
          this.tooltip.style.display = 'block';
          this.addMouseHandler();
        },
        /**
         * 隐藏已经显示的Tooltip
         */
        hideTooltip: function() {
          if (this.tooltip) {
            this.removeMouseHandler();
            this.tooltip.style.display = 'none';
          }
        },
        /**
         * 监听鼠标移动事件
         */
        addMouseHandler: function() {
          window.addEventListener('mousemove', this.eventFunction);
        },
        /**
         * 移除鼠标移动事件
         */
        removeMouseHandler: function() {
          window.removeEventListener('mousemove', this.eventFunction);
        },
        /**
         * 更新位置信息
         */
        updatePosition: function(element) {
          //Save the tooltip function as it is required to remove the event handler from the document.
          this.eventFunction = function(e) {
            element.style.left = e.clientX + 'px';
            element.style.top = e.clientY + 'px';
          };
        }

      };
    }
  ]);
