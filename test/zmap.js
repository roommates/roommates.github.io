// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
//
// NOTES: On add marker(s), no pop-up info window
//        After saving, no pop-ups are displayed until page is refreshed
//        Awkward parentheses errors are allow it to work
//        tmp loads all the markers as google objects
//        curMarkers stores all markers saved into a collection
//

Players = new Meteor.Collection("players");
Markers = new Meteor.Collection("markers"); //lowercase -> Mongo
console.log('first');
curMarkers = Markers.find().fetch();
console.log('curMarkers set to' + curMarkers.length);
newMarkers = [];
tmp = [];

if (Meteor.isClient) {
    GoogleMaps.init({
            'sensor': true, //optional
            //'key': 'MY-GOOGLEMAPS-API-KEY', //optional
            //'language': 'de' //optional
        },
        function() {
            var haightAshbury = new google.maps.LatLng(37.7699298, -122.4469157);
            var mapOptions = {
                zoom: 12,
                center: haightAshbury,
            };
            map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
            map.zach = [];

            google.maps.event.addListener(map, 'click', function(event) {
                x(event.latLng);
            });

            y = function(item) {
                google.maps.event.addListener(item, 'click', function() {
                    info(item);
                    return 'blah' + item.__gm_id;
                });
            };

            // Add a marker to the map and push to the array.
            x = function addMarker(location) {
                console.log("Your location is:  " + location);
                $('<div/>').text(location).prepend($('<em/>').text("Your location" + ': ')).appendTo($('#map-canvas'));
                var ans = prompt('save, bitch?');
                if (ans == 'yes') {

                    var marker = new google.maps.Marker({
                        position: location,
                        map: map
                    });
                    map.zach.push(marker);
                    newMarkers.push(marker); //add to new marker array
                    console.log('marker added to local map');
                }
            }


            info = function infoView(el) {
                lats = el.position.k
                lngs = el.position.B;

                infowindow = new google.maps.InfoWindow({
                    content: '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h1 id="firstHeading" class="firstHeading">' +
                         el.__gm_id + "</h1>" +
                        'Lat:' + lats +
                        '<br> Long: ' + lngs +
                        '</div>'

                })
                infowindow.open(map, el);
            }


            Deps.autorun(function() {
                curMarkers = Markers.find().fetch();
                console.log("Fetched, willl populate the map with:  " + curMarkers.length);

                if (curMarkers.length > 0) {
                    for (keys in curMarkers) {
                        var dbMarker = new google.maps.Marker({
                            position: {
                                lat: curMarkers[keys].lat,
                                lng: curMarkers[keys].lng
                            },
                            map: map
                        });
                        tmp.push(dbMarker);
                        console.log(tmp[keys].__gm_id);
                        y(tmp[keys]);
                        console.log('end' + tmp[keys].__gm_id);

                    }
                    console.log('marker added to local map');
                }

                return;
            });



            curMarkers = Markers.find().fetch();
            var markerDep = new Deps.Dependency; // FIRST ADDED LINE

            getM = function() {
                markerDep.depend(); // SECOND ADDED LINE
                return curMarkers;
            };


            // Meteor.startup(function() {
            //  curMarkers = Markers.find().fetch();
            /*              console.log("Populating the map with:  " + curMarkers.length);
                curMarkers = Markers.find().fetch();
                console.log("Re-allocated curMarkers, Populating the map with:  " + curMarkers.length);
                if (curMarkers.length > 0) {
                    for (keys in curMarkers) {
                        var dbMarker = new google.maps.Marker({
                            position: {
                                lat: curMarkers[keys].lat,
                                lng: curMarkers[keys].lng
                            },
                            map: map
                        });
                        tmp.push(dbMarker);
                        console.log(tmp[keys].__gm_id);
                        y(tmp[keys]);
                        console.log('end' + tmp[keys].__gm_id);

                    }
                    console.log('marker added to local map');
                }  //end of pop function
*/

            // });

        }   // H A L P ME
    );  // W H E R E    D  O  E  S   T H I S   B E L O N G   T O


    Template.map.events({
        'click #map-canvas': function() {
            alert('pooop');
        }
    });

    Template.map.greeting = function() {
        return 'Map is loading';
    }

    Template.markerlist.all_markers = function() {
        return Markers.find();
    }


    /* posRef.on('child_added', function(snapshot) {
            var mymarker = snapshot.val();
            displayMapMarkers(mymarker.firepos);
          });
    */


    Template.panel.events({
        'click #myAdd': function() {
            if (newMarkers.length < 1) {
                alert('none to save');
            }
            if (newMarkers.length > 0) {
                for (keys in newMarkers) {
                    tmp.push(newMarkers[keys])
                    console.log(tmp[keys]);
                    console.log("Position data is:  " + tmp[keys].position);
                    var position = newMarkers[keys].position;
                    var lat = newMarkers[keys].position.k;
                    var lng = newMarkers[keys].position.B;
                    var date = new Date();
                    date = date.toJSON();
                    Markers.insert({
                        text: 'Something',
                        //map_id: Session.get('list_id'),
                        pos: position,
                        lat: lat,
                        lng: lng,
                        date: date,
                        //timestamp: (new Date()).getTime(),
                    });
                    curMarkers.push(newMarkers[keys]); //add to new marker array
                }
                alert('saved');
                newMarkers = [];
            }

        }
    });

    Template.hello.events({
        'click input': function() {
            alert('pooop');
        }
    });

    Template.hello.events({
        'click #test': function() {
            alert('peeper');
        }
    });

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
    console.log('server init');

    Meteor.startup(function() {

        curMarkers = Markers.find().fetch();
        console.log('server curMarkers set to' + curMarkers.length);

        if (Players.find().count() === 0) {
            var names = ["Ada Lovelace",
                "Grace Hopper",
                "Marie Curie",
                "Carl Friedrich Gauss",
                "Nikola Tesla",
                "Claude Shannon"
            ];
            for (var i = 0; i < names.length; i++)
                Players.insert({
                    name: names[i],
                    score: Math.floor(Random.fraction() * 10) * 5
                });
        }
    });

    Meteor.publish("markers", function() {
        console.log('published');
        return Markers.find(); // everything
    });
}
