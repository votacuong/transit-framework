TransitRoute.Plugin.map = function( params, callback ){
	
	this.initMap = function() 
	{
		
		const map = new google.maps.Map(window.TransitDocument.getElementById("map"), {
			
			zoom: 13,
			
			center: { lat: 51.501904, lng: -0.115871 },
			
		});
		
		const transitLayer = new google.maps.TransitLayer();

		transitLayer.setMap(map);
		
	}
	
	return this;
	
};
