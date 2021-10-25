export default {
    testImgUrl(url){
		return new Promise(function(resolve) {
			const timeout = 5000;
			let timer, img = new Image();
			img.onerror = img.onabort = function() {
				clearTimeout(timer);
				resolve(false);
			};
			img.onload = function() {
				clearTimeout(timer);
				resolve(true);
			};
			timer = setTimeout(function() {
				img.src = "//!!!!/noexist.jpg";
				resolve(false);
			}, timeout); 
			img.src = url;
		});
	},

	testVideoUrl(url){
		return /^https?:\/\/.*\.(mp4|ogg|webm)$/i.test(url.trim())
	},

	parseYouTube(str) {
		// url : //youtube.com/watch?v=Bo_deCOd1HU
		// share : //youtu.be/Bo_deCOd1HU
		// embed : //youtube.com/embed/Bo_deCOd1HU
		
		const re = /\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i; 
		const matches = re.exec(str);
		if (matches && matches[1]){
			return 'https://www.youtube.com/embed/'+matches[1]
		}
	},

	parseVimeo(str) {
		// http://vimeo.com/86164897
		
		const re = /\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i;
		const matches = re.exec(str);
		if(matches && matches[1]) {
			return 'https://player.vimeo.com/video/'+matches[1]
		}
	}
}