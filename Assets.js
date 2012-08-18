var Sburb = (function(Sburb){




////////////////////////////////////////////
//AssetManager Class
////////////////////////////////////////////

//Constructor
Sburb.AssetManager = function() {
	this.totalAssets = 0;
	this.totalLoaded = 0;
	this.assets = {};
	this.loaded = {};
	this.recurrences = {};
	this.description = "";
	this.resourcePath = "";
	this.levelPath = "";
}

Sburb.AssetManager.prototype.resolvePath = function(path){
	if(path.indexOf(this.resourcePath)==-1){
		return this.resourcePath+"/"+path;
	}else{
		return path;
		
	}
}

//get the remaining assets to be loaded
Sburb.AssetManager.prototype.totalAssetsRemaining = function() {
	return this.totalAssets - this.totalLoaded;
}

//have all the assets been loaded
Sburb.AssetManager.prototype.finishedLoading = function() {
	return (this.totalAssets && (this.totalAssets == this.totalLoaded));
}

Sburb.AssetManager.prototype.draw = function(){
	Sburb.stage.fillStyle = "rgb(0,0,0)";
	Sburb.stage.fillRect(-3,-3,Sburb.Stage.width+6,Sburb.Stage.height+6);
	Sburb.stage.fillStyle = "rgb(255,255,255)"
	Sburb.stage.font="30px Arial";
	Sburb.stage.textAlign = "center";
    Sburb.stage.fillText("Loading "+this.description,Stage.width/2,Stage.height-80);
    Sburb.stage.fillText(this.totalLoaded+"/"+this.totalAssets,Stage.width/2,Stage.height-50);
}

//check if a specific asset has been loaded
Sburb.AssetManager.prototype.isLoaded = function(name) {
	// turn undefined into false
	return this.loaded[name] ? true : false;
}

//reset the asset manager to have no assets
Sburb.AssetManager.prototype.purge = function() {
	this.assets = {}
	this.loaded = {}
	this.totalLoaded = 0;
	this.totalAssets = 0;
}

//load the given asset
Sburb.AssetManager.prototype.loadAsset = function(assetObj) {
	var name = assetObj.name;
	this.assets[name] = assetObj;
	if(assetObj.instant) {
		return;
	}

	var oThis = this;
	this.assetAdded(name);	
	var loadedAsset = this.assets[name].assetOnLoadFunction(function() { oThis.assetLoaded(name); });
	if(!loadedAsset && assetObj.needsTimeout && assetObj.checkLoaded){
		this.recurrences[assetObj.name] = assetObj.checkLoaded;
	}
}

//log that the asset was added
Sburb.AssetManager.prototype.assetAdded = function(name) {
	this.totalAssets++;
	console.log("in:"+name);
	this.loaded[name] = false;
}

//log that the asset was loaded
Sburb.AssetManager.prototype.assetLoaded = function(name){
	if(this.assets[name]){
		if(!this.loaded[name]){
			this.loaded[name] = true
			this.totalLoaded++;
			
			this.draw();
			
			if(this.finishedLoading() && Sburb._hardcode_load){
				// only really here to work for old hard-loading
				Sburb.finishInit();
				initFinished = true;
				
			}
		}
	}
};






////////////////////////////////////////////
//Related Utility functions
////////////////////////////////////////////

//Create a graphic Asset
Sburb.createGraphicAsset = function(name, path) {
    var ret = new Image();
    ret.loaded = false;
    ret.onload = function() {
		ret.loaded = true;
    }
    ret.src = Sburb.assetManager.resolvePath(path);
    ret.type = "graphic";
    ret.name = name;
    ret.assetOnLoadFunction = function(fn) {
		if(ret.loaded) {
			if(fn) { fn(); }
			return true;
		} else {
			ret.onload = function () {
				ret.loaded = true
				if(fn) { fn(); }
			}
			return false;
		}
    };
    return ret;
}

//create an audio Asset
Sburb.createAudioAsset = function(name,sources) {
    var ret = new Audio();
    ret.name = name
    ret.type = "audio";
    ret.preload = true;
    //ret.needsTimeout = true;
    for (var a=0; a < sources.length; a++) {
		var tmp = document.createElement("source");
		tmp.src = Sburb.assetManager.resolvePath(sources[a]);
		ret.appendChild(tmp);
    }
    ret.assetOnLoadFunction = function(fn) {
		this.checkLoaded = function(){
			//console.log("check!",ret.name);
			if (ret.readyState==4) {
				//console.log("good!");
				if(fn) { fn(); }
				return true;
			}
			return false;
		}
		if(!this.checkLoaded()){
			ret.addEventListener('loadeddata', fn);
			return false;
		}else{
			return true;
		}
    };
    return ret;
}

//create a flash movie Asset
Sburb.createMovieAsset = function(name,path){
	var ret = {src:Sburb.assetManager.resolvePath(path)};
	document.getElementById("movieBin").innerHTML += '<div id="'+name+'"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" id="movie" width="550" height="400"><param name="allowScriptAccess" value="always" /\><param name="movie" value="'+name+'" /\><param name="quality" value="high" /\><param name="bgcolor" value="#ffffff" /\><embed src="'+path+'" quality="high" bgcolor="#ffffff" width="550" height="400" swLiveConnect=true id="movie'+name+'" name="movie'+name+'" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /\></object></div>';
	
	
	ret.name = name;
	ret.type = "movie";
	ret.instant = true;
	
	document.getElementById(name).style.display = "none";

	return ret;
	
}

//create a path asset
Sburb.createPathAsset = function(name, path) {
    var ret = path;
    ret.name = name;
    ret.type = "path";
    ret.instant = true;
    ret.assetOnLoadFunction = function(fn) {
		if(fn) { fn(); }
		return;
    }
    return ret
}

Sburb.createFontAsset = function(name, sources){
	var ret = {font:sources[0]};
	ret.name = name;
	ret.originalVals = sources;
	ret.type = "font";
	ret.instant = true;
	ret.assetOnLoadFunction = function(fn) {
		if(fn) { fn(); }
		return;
    }
    return ret
}

return Sburb;
})(Sburb || {});
