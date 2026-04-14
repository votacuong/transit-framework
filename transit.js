( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "Transit requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	var TransitUtils = {
		
		__index: [ ],
		
		__objects: [ ],
		
		index: function( el )
		{
			
			if ( this.__index.indexOf( el ) != -1 )
			{
				
				return this.__index.indexOf( el );
				
			}
			
			var index = this.__index.length;
			
			this.__index[ index ] = el;
			
			return { 'index' : index };
			
		},
		
		object: function( el )
		{
			
			var index = this.index( el );
			
			if ( typeof index != "object" )
			{
				
				return this.__objects[ index ];
				
			}
			
			this.__objects[ index.index ] = new TransitCompiler( el );

			return this.__objects[ index.index ];
			
		},
		
		query: function( el )
		{
			
			if ( typeof el == "object" )
			{
				
				return [ el ];
				
			}
			
			if ( this.isHTML( el ) )
			{
				
				var wrapper = window.TransitDocument.createElement( "div" );
				
				wrapper.innerHTML = el;
				
				return wrapper.childNodes;				
				
			}
			
			return Array.from( window.TransitDocument.querySelectorAll( el ) );
			
		},
		
		isHTML: function( str )
		{
			
			var wrapper = window.TransitDocument.createElement('div');
			
			wrapper.innerHTML = str;

			for (var c = wrapper.childNodes, i = c.length; i--; ) 
			{
				
				if (c[i].nodeType == 1) return true; 
			
			}

			return false;
			
		},
		
		DOMEval: function( code ) 
		{

			var script = window.TransitDocument.createElement( "script" );

			script.text = code;
			
			window.TransitDocument.head.appendChild( script )
			
			script.parentNode.removeChild( script );
			
		},
		
		extend: function( )
		{
			
			if ( arguments.length == 0 )
			{
				
				return  { };
				
			}
			
			if ( arguments.length == 0 )
			{
				
				return Object.assign( arguments[ 0 ] );
				
			}
			
			var obj = object.assign( arguments [ 0 ] );
			
			for( var k = 1; k < arguments.length; k++ )
			{
				
				for( var o in arguments[ k ] )
				{
					
					obj[ o ] = arguments[ k ][ o ];
					
				}
				
			}
			
			return obj;
			
		}
		
	};
	
	var TransitCompiler = function( el )
	{
		
		this.el = el;
		
		this.o = TransitUtils.query( this.el );
		
		this.testEnvironment = function( )
		{
			
			return this;
			
		};
		
		var wrapper = window.TransitDocument.createElement( "div" );
		
		for( var e in wrapper )
		{
			
			if ( e.indexOf( 'on' ) != -1 )
			{
				
				var event = e.replace( 'on', '' );
				
				this[ event ] = function( event, callback )
				{
					
					this.o.forEach(function( e, n ){
						
						e.addEventListener( event, function( ev ){
							
							this.callback = callback;
							
							this.callback( ev );
							
						});
						
					});
					
				}.bind( this, event );
				
			}
			
		}
		
		for( var p in TransitRoute.Plugin )
		{
			
			this.o.forEach( function(p, e, n){
				
				this[ p ] = function( p, e )
				{
					
					e[ p ] = TransitRoute.Plugin[ p ];
				
					if ( arguments.length > 2 )
					{
						
						var ars = [ ];
						
						for( var k = 2; k < arguments.length; k++ )
						{
							
							if ( typeof arguments[ k ] == "string" )
							{
								
								TransitUtils.DOMEval( "var $ar" + k + " = '" + arguments[ k ] + "';");
								
							}
							else if( typeof arguments[ k ] == "object" )
							{
								
								TransitUtils.DOMEval( "var $ar" + k + " = " + JSON.stringify( arguments[ k ] ) + ";");
								
							}
							else
							{
								
								TransitUtils.DOMEval( "var $ar" + k + " = " + arguments[ k ] + ";");
								
							}
							
							ars[ k - 2 ] = "$ar" + k;
							
						}
						
						window[ 'Plugin_Object' ] = e;
						
						window[ 'Plugin_Return' ] = null;
						
						TransitUtils.DOMEval( "window[ 'Plugin_Return' ] = window[ 'Plugin_Object' ][ '" + p + "']( " + ars.join( ", ") + " );");
						
						return window[ 'Plugin_Return' ];
						
					}
					else
					{
						
						return e[ p ]( );
						
					}
					
				}.bind( this, p, e );
				
			}.bind( this, p) );
			
		}
		
		return this;
		
	};
	
	window[ 'TransitDocument' ] = document;
	
	var TransitRoute = function( el, Dom )
	{
		
		if ( typeof Dom != "undefined" && Dom instanceof Document )
		{
			
			window.TransitDocument = Dom;
			
		}
		else
		{
			
			window.TransitDocument = document;
			
		}
		
		if ( TransitUtils.isHTML( Dom ) )
		{
			
			window.TransitDocument = new DOMParser().parseFromString(Dom, "text/html");
			
		}
		
		this.el = el;
		
		this.ready = function( callback )
		{
			
			this.callback = callback;
			
			var TransitReady = function( callback )
			{
				
				this.completed = function( obj )
				{
					
					if ( typeof this[ 'executed' ] == "undefined" )
					{
						
						this[ 'executed' ] = true;
						
						TransitUtils.query( obj.el ).forEach(function( e, n ){
							
							this.callback( e, n );
							
						}.bind( obj ) );						
						
					}
					
					return this;
				};
				
			};
			
			if ( window.TransitDocument.readyState === "complete" || window.TransitDocument.readyState === "interactive" ) 
			{
		
				TransitUtils.query( this.el ).forEach(function( e, n ){
							
					this.callback( e, n );
					
				}.bind( this ) );
						
			} 
			else
			{
				var TransitReadyComplete = new TransitReady();
				
				window.TransitDocument.addEventListener( "DOMContentLoaded", function(){
					
					TransitReadyComplete.completed( this );
					
				}.bind( this ) );

				window.addEventListener( "load",  function(){
					
					TransitReadyComplete.completed( this );
					
				}.bind( this ) );
				
			}
			
			return this;
			
		};
		
		this.transit = function( el )
		{
			
			if ( typeof el != "undefined" )
			{
				
				return TransitUtils.object( el ).testEnvironment( );
				
			}
			else
			{
				
				return TransitUtils.object( this.el ).testEnvironment( );
				
			}
			
		};
		
		return this;
		
	};
	
	TransitRoute.Plugin = { };
	
	TransitRoute.Request = function( ){
		
		return {
			
			templateCallback: function(xhr, cb){
		
				var data;
				
				switch(xhr.getResponseHeader('Content-Type').toLowerCase())
				{
					
					case 'application/json':
					
					case 'application/json; charset=utf-8':
					
						data = JSON.parse(xhr.responseText);
						
						break;
					
					default:
					
						data = xhr.responseText;
						
				}
				
				cb(data, xhr);
				
			},
			
			buildQueryString: function( data )
			{
				
				if(!data) return null;
				
				var qs = [];
				
				for(var key in data)
				{
					
					qs.push(encodeURIComponent(key)+'='+encodeURIComponent(data[key]));
					
				}
				
				return (qs.length ? '?' + qs.join('&') : null);
				
			},
			
			send: function( url, opt )
			{
				
				if(!url) throw 'TransitRequest: send() invalid parameters';
				
				if( typeof url === 'object' )
				{
					
					opt = url;
					
					url = opt.url;
					
				}
				
				var x;
				
				if( opt.xhr && (typeof opt.xhr === 'function') )
				{
					
					x = opt.xhr();
					
				} 
				else 
				{
					
					x = new XMLHttpRequest();
					
				}
				
				if( typeof opt.contentType === 'undefined' )
				{
					
					opt.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
					
				}
				
				var method;
				
				var data;
				
				method = opt.method || 'GET';
				
				if(method === 'GET' || method === 'DELETE')
				{
					
					if( typeof data === 'string' )
					{
						
						url = opt.url + '?' + data;
						
					} 
					else 
					{
						
						data = this.buildQueryString( opt.data );
						
						url += (data ? data : '');
						
					}
					
				} 
				else 
				{
					
					url = opt.url;
					
				}
				
				if( opt.success && typeof opt.success === 'function' )
					
					x.addEventListener('load', (e) => { this.templateCallback(e.target, opt.success); });
					
				if( opt.error && typeof opt.error === 'function' )
					
					x.addEventListener('error', (e) => { this.templateCallback(e.target, opt.error); });
					
				if( opt.complete && typeof opt.complete === 'function' )
					
					x.addEventListener('loadend', (e) => { this.templateCallback(e.target, opt.complete); });
					
				if( opt.progress && typeof opt.progress === 'function' )
					
					x.addEventListener('progress', (e) => { this.templateCallback(e.target, opt.progress); });
					
				x.open( method, url, true );
						
				if( typeof opt.contentType === 'string' )
				{
					
					x.setRequestHeader('Content-Type', opt.contentType);
					
				} 
				
				if( opt.headers && (typeof opt.headers === 'object') )
				{
					
					for(const h in opt.headers)
					{
						
						x.setRequestHeader( h, opt.headers[h] );
						
					}
					
				}

				x.send((method === 'GET' || method === 'DELETE')? null : data);
				
				x.success = function( x, callback )
				{
					
					x.addEventListener('load', (e) => { this.templateCallback(e.target, callback); });
					
					return this;
					
				}.bind( this, x );
				
				x.error = function( x, callback )
				{
					
					x.addEventListener('error', (e) => { this.templateCallback(e.target, callback); });
					
					return this;
					
				}.bind( this, x );
				
				x.complete = function( x, callback )
				{
					
					x.addEventListener('loadend', (e) => { this.templateCallback(e.target, callback); });
					
					return this;
					
				}.bind( this, x );
				
				x.progress = function( x, callback )
				{
					
					x.addEventListener('progress', (e) => { this.templateCallback(e.target, callback); });
					
					return this;
					
				}.bind( this, x );
				
				return x;
				
			},
			
			get: function(url, data, callback, contentType)
			{
				
				if(typeof data === 'function')
				{
					
					callback = data;
					
					data = undefined;
					
				}
				
				if(typeof callback === 'string')
				{
					
					contentType = callback;
					
					callback = undefined;
					
				}
				
				return this.send(url, {
					
					success:callback,
					
					data:data,
					
					method:'GET',
					
					contentType:contentType
					
				});
				
			},
			
			post: function(url, data, callback, contentType)
			{
				
				if(typeof data === 'function')
				{
					
					callback = data;
					
					data = undefined;
					
				}
				
				if(typeof callback === 'string')
				{
					
					contentType = callback;
					
					callback = undefined;
					
				}
				
				return this.send(url, {
					
					success:callback,
					
					data:data,
					
					method:'POST',
					
					contentType:contentType
					
				});
				
			},
			
			getJSONL: function(url, data, callback)
			{
				
				return this.get(url, data, callback, 'application/json; charset=UTF-8');
				
			},
			
			postJSON: function(url, data, callback)
			{
				
				return this.post(url, data, callback, 'application/json; charset=UTF-8');
				
			}
	
		};
		
	};
	
	if ( typeof noGlobal === "undefined" ) 
	{
		
		window.TransitRoute = TransitRoute;
		
	}
	
	return TransitRoute;

});