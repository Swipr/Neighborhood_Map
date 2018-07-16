// Model
var places = [{
    name: "Ramenka",
    id: 0,
    location: {
        lat: 47.4969103,
        lng: 19.0637142,
        
    }
}, {
    name: "Beat On The Brat",
    id: 1,
    location: {
        lat: 47.4976986,
        lng: 19.0650191
    }
}, {
    name: "Kádár Étkezde",
    id: 2,
    location: {
        lat: 47.4997497,
        lng: 19.0643317
    }
}, {
    name: "Csak a jó sör!",
    id: 3,
    location: {
        lat: 47.5016342,
        lng: 19.0630657
    }
}, {
    name: "Fogas Ház és Kert",
    id: 4,
    location: {
        lat: 47.5003694,
        lng: 19.0649191
    }
}, {
    name: "InGame Gamer Bar and VR arcade",
    id: 5,
    location: {
        lat: 47.4989487,
        lng: 19.0645543
    }
}, {
    name: "Hopaholic",
    id: 6,
    location: {
        lat: 47.4999517,
        lng: 19.0653536
    }
}, {
    name: "Juicy + Budapest Bägel",
    id: 7,
    location: {
        lat: 47.4984549,
        lng: 19.0579426
    }
}, {
    name: "Buddha Mini Thai Wok Bar",
    id: 8,
    location: {
        lat: 47.5001691,
        lng: 19.0583557
    }
}, {
    name: "Gozsdu udvar",
    id: 9,
    location: {
        lat: 47.4984295,
        lng: 19.0581787
    }
}, {
    name: "Cat Café",
    id: 10,
    location: {
        lat: 47.5012212,
        lng: 19.0558655
    }
}];


var Location = function(data) {
    var self = this;

    this.title = data.name;
    this.location = data.location;
     this.id = data.id;
    this.show = ko.observable(true);
}

var markers = [];


function initMap() {
    // New Google Map object of Budapest
    var budapest = {
        lat: 47.499416,
        lng: 19.060833
    };
    var map = new google.maps.Map(document.getElementById("map"), {
        center: budapest,
        zoom: 16.2
    });

    var infoWindow = new google.maps.InfoWindow();

    // Create markers
    for (var i = 0; i < places.length; i++) {
        (function() {
            var iwContent;

            var marker = new google.maps.Marker({
                map: map,
                title: places[i].name,
                position: places[i].location,
                animation: google.maps.Animation.DROP
            });

            // Store markers in array
            markers.push(marker);

            places[i].marker = marker;

            // Add listener to marker
            marker.addListener("click", function() {
                populateInfoWindow(this, infoWindow);
                infoWindow.setContent(iwContent);
            });

            // Populate InfoWindow
            function populateInfoWindow(marker, infoWindow) {
                if (infoWindow.marker != marker) {
                    infoWindow.marker = marker;
                    infoWindow.setContent(marker.iwContent);

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 700);

                    infoWindow.open(map, marker);

                    infoWindow.addListener("closeclick", function() {
                        infoWindow.setMarker = null;
                    });
                }
            }


            // FourSquare API
            $.ajax({
                url: "https://api.foursquare.com/v2/venues/search",
                dataType: "json",
                data: {
                    client_id: "OOETJXKGR55YA4HN1SFZ5QMZCWWKL3YIBGWBDJZVFCSC43OT",
                    client_secret: "RUAFMYXCJVFM1DJDZ5VRGG3JCBIW2PGUY0PBIJPWIOG3MDQP",
                    query: places[i].name,
                    near: "Budapest",
                    v: 20180714
                },
                success: function(data) {
                    var venue = data.response.venues;

                    iwContent = '<div class="infowindow"><strong>' +
                        venue[0].name + "</strong><br>" +
                        venue[0].location.formattedAddress[0] + ", " +
                        venue[0].location.formattedAddress[1] + "<br>" +
                        venue[0].categories[0].pluralName + "<br>" +
                        '<a href="https://foursquare.com/v/' + venue[0].id + '">More info..</a>';
                    marker.iwContent;
                },
                // Squarespace error message
                error: function() {
                    iwContent = "<div>Something is wrong. Could't communicate with FourSquare. Please refresh the page or try again later.</div>";
                }
            });
        })(i);
    }
}


// ViewModel
var ViewModel = function() {

    var self = this;

    this.allLocations = ko.observableArray([]);
    this.userInput = ko.observable("");

    places.forEach(function(data) {
        this.allLocations().push(new Location(data));
    });

    // When a link clicked, trigger the associated marker
    self.clicked = function(clicked) {
        google.maps.event.trigger(places[clicked.id].marker, "click");
    }

    // Filter
    this.filter = ko.computed(function() {
        var input = self.userInput().toLowerCase();

        for (var i = 0; i < self.allLocations().length; i++) {
            if (this.allLocations()[i].title.toLowerCase().indexOf(input) >= 0) {
                self.allLocations()[i].show(true);
                if (markers[i]) {
                    markers[i].setVisible(true);
                }
            } else {
                self.allLocations()[i].show(false);
                if (markers[i]) {
                    markers[i].setVisible(false);
                }
            }
        }
    });
}

ko.applyBindings(ViewModel());

// Error handling
function mapError() {
    alert("Couldn't load Google Maps. Please refresh the page or try again later.");
    var errorMsg = "<div>Couldn't load Google Maps. Please refresh the page or try again later.</div>";
    document.getElementById("map").innerHTML = errorMsg;
}