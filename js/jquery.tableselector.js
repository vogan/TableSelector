/**
 * tableselector - a jQuery Plugin
 * provides a click'n select environment for html tables, supporting SHIFT and STRG Keys
 * 
 * Copyriht (c) 2011 Andreas Vogl
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function( $ ){
	var defaults = {
		multiple: true,
		rowIdPrefix: 'rowid-',
		selectedClass: 'row-selected',
		event: 'click'
	};
	
	var methods = {
		init : function( options ) {
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('tableselector');
				
				if (!data ) {
					$this.data('tableselector', {
						target: $this,
						options: $.extend(defaults,options),
						selection: reset()
					});
					data = $this.data('tableselector');
				}
				
				$('tbody tr',$this).on(data.options.event,function(event){
					tsEventHandler($(this),event,data);
					return true;
				});
			});
		},
		data : function() {
			var data = new Object();
			this.each(function(){
				var $this = $(this);
				var tableData = $this.data('tableselector');
				
				if(tableData){
					var id = $this.attr('id');
					if(id){
						data[id] = tableData.selection.elements;
					}
				}
			});
			return data;
		},
		inverse: function(){
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('tableselector');
				if(data){
					inverseSelection(data);
					selectionStyle(data);
				}
			});
		},
		reset: function() {
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('tableselector');
				if(data){
					data.selection = reset();
					selectionStyle(data);
				}
			});
		}
	};

	function tsEventHandler($element,event,data){
		var rowId = getRowId($element,data);
		if(rowId){
			if(event.shiftKey && data.options.multiple){
				selectRange(data,rowId);
			}else if((event.ctrlKey || event.metaKey) && data.options.multiple){
				toggle(data,rowId);
			}else{
				data.selection = reset();
				add(data,rowId);
			}
			data.selection.current = rowId;
			selectionStyle(data);
		}
	}

	function add(data,rowId){
		selectionModifier(data,rowId,false);
	}
	
	function toggle(data,rowId){
		selectionModifier(data,rowId,true);
	}

	function selectionModifier(data,rowId,toggle){
		var elements = [];
		var found = false;
		$(data.selection.elements).each(function(){
			if(''+rowId == this){
				found = true;
			}else{
				elements.push(this);
			}
		});
		
		if(found && !toggle){
			elements.push(rowId);
		}else if(!found){
			elements.push(rowId);
		}
		data.selection.elements = elements;
	}

	function selectRange(data,rowId){
		var currentFound = false;
		var rowFound = false;
		var elements = [];
		
		$('tbody tr:visible',data.target).each(function(){
			id = getRowId($(this),data);
			if(currentFound != rowFound){
				elements.push(id);
			}
			
			if(rowId == id){
				rowFound = true;
				elements.push(id);
			}
			
			if(data.selection.current == id){
				currentFound = true;
			}
		});
		
		$(elements).each(function(){
			add(data,this);
		});
	}
	
	function inverseSelection(data){
		var newSelection = [];
		$('tbody tr:visible',data.target).each(function(){
			var rowId = getRowId($(this),data);
			var found = false;
			for(var i=0;i<data.selection.elements.length;i++){
				if(''+data.selection.elements[i] == rowId){
					found = true;
					break;
				}
			}
			
			if(!found){
				newSelection.push(rowId);
			}
		});
		data.selection.elements = newSelection;
	}
	
	function reset(){
		return {
			elements: [],
			current: -1
		};
	}
	
	function getRowId($rowElement,data){
		var match = $rowElement.attr('class').match(new RegExp(''+data.options.rowIdPrefix+'([a-zA-Z0-9-]+)'));
		if(match){
			return ""+match[1];
		}
		return null;
	}
	
	function selectionStyle(data){
		$('tbody tr.'+data.options.selectedClass,data.target).removeClass(data.options.selectedClass);
		$(data.selection.elements).each(function(){
			$('tbody tr.'+data.options.rowIdPrefix+this).addClass(data.options.selectedClass);
		});
	}

	$.fn.tableselector = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tableselector' );
		}
	};
})( jQuery );
