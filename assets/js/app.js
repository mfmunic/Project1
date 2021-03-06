var resultArray = []
var startLoc = {};
var startAddr = "";

$(document).ready(function() {

    // Hide results page on load
    $(".results-page").hide();

    //------------transition from search view to results view-------------------------------
    $(".init").on("click", function(event) {

        console.log($(this).attr("id"))
        event.preventDefault();

        if ($(this).attr("id") === "searchBtn" && $("#icon_prefix").val().length > 0) {

            $("#locationEntered").text($("#icon_prefix").val().trim());
            console.log("Searching...");
            startAddr = $("#icon_prefix").val().trim();

            searchAll(startAddr, 2);

            $("#searchPageContainer").css("opacity", "0");
            $("#mainContainer").css("visibility", "visible");

            var showHeader = setTimeout(function() {
                $("#searchContainer").css("visibility", "hidden");
                $(".search-page").css("display", "none");
            }, 500);

            var showResultsPage = setTimeout(function() {

                $(".results-page").css("opacity", "1");
                $("#mainContainer").css("opacity", "1");
                $("body").css("background-image", "none");
                $(".page-footer").css("display", "none");
                $(".results-page").show(0);
            }, 750);
        }

        // Populate field with user coordinates
        else if ($(this).attr("id") === "geoBtn") {
            getCoorCurrentLocation(function(coord) {
                startLoc = Object.assign({}, coord);
                // console.log("Current user pos: (" + coord.lat + ", " + coord.lng + ")");
                $("#icon_prefix").val(coord.lat + ", " + coord.lng);
                $(".input-label").addClass("active");
                $(".prefix").addClass("active");
            });
        }
    });

    $("#logo").on("click", function() {
        window.location.href = "index.html";
    });

    $(".dropdown-item-radius").on("click", function() {
        $("#radiusBtn").text($(this).attr("data-display"));
    });

    //---------------------------------------modal---------------------------------------

    $("#addLoc").on("click", $(".modal").modal());

    // console.log($("#venueTypeBtn").text());

    $(".dropdown-item-venue").on("click", function() {
        $("#venueTypeBtn").text($(this).attr("data-type"));
        $("#venueTypeBtn").removeClass("blue");
        $("#venueTypeBtn").css("background-color", $(this).attr("data-color"));
        // console.log($("#venueTypeBtn").text());
        enableShake();
    });

    $("#new-name").keyup(enableShake);
    $("#new-address").keyup(enableShake);

    function enableShake() {
        if ($("#new-name").val().length > 0 && $("#new-address").val().length > 0 && $("#venueTypeBtn").text() != "type") {
            $("#shakeBtn").removeClass("disabled");

            // Handler for when user adds a venue
            $("#shakeBtn").on("click", function() {
                let name = $("#new-name").val().trim();
                let address = $("#new-address").val().trim();
                let category = $("#venueTypeBtn").text();

                if (category === "eat") {
                    category = "restaurants";
                } else if (category === "play") {
                    category = "parks";
                } else if (category === "stay") {
                    category = "hotels";
                } else {
                    console.log("Invalid category. Venue not added");
                    return;
                }

                // Get and verify coordinates of address                
                getCoorFromAddress(address, function(addr) {
                    if (addr === null) {
                        console.log("Invalid address. Venue not added!")
                    } else {
                        let venue = {
                            name: name,
                            address: address,
                            lat: addr.lat,
                            lng: addr.lng
                        }
                        startLoc = {
                            lat: addr.lat,
                            lng: addr.lng
                        };
                        addUserVenueToFirebase(category, venue);
                        console.log("Added new venue to firebase: ");
                        console.log(venue);
                    }
                });
            });
        } else {
            if (!$("#shakeBtn").hasClass("disabled")) {
                $("#shakeBtn").addClass("disabled");
                // Remove any handlers
                $("#shakeBtn").off();
            }
        }
    };

    //------------------------------------end of modal-----------------------------------

    //-----------------------filter functions------------------------------

    // Handler for when user flips a filter
    $("#eatSwitch").on("click", function() {

        if (!$(this).prop("checked")) {
            $(".eatVenue").hide();
            toggleMarkerGroup("restaurants", false);
            showVenues.restaurants = false;
        } else {
            $(".eatVenue").show();
            toggleMarkerGroup("restaurants", true);
            showVenues.restaurants = true;
        }
    });

    $("#playSwitch").on("click", function() {

        if (!$(this).prop("checked")) {
            $(".playVenue").hide();
            toggleMarkerGroup("parks", false);
            showVenues.parks = false;
        } else {
            $(".playVenue").show();
            toggleMarkerGroup("parks", true);
            showVenues.parks = true;
        }
    });

    $("#staySwitch").on("click", function() {

        if (!$(this).prop("checked")) {
            $(".stayVenue").hide();
            toggleMarkerGroup("hotels", false);
            showVenues.hotels = false;
        } else {
            $(".stayVenue").show();
            toggleMarkerGroup("hotels", true);
            showVenues.hotels = true;
        }
    });

    $("#meetupSwitch").on("click", function() {

        if (!$(this).prop("checked")) {
            $(".meetup-result-table").hide();
            toggleMarkerGroup("meetups", false);
            showVenues.meetups = false;
        } else {
            $(".meetup-result-table").show();
            toggleMarkerGroup("meetups", true);
            showVenues.meetups = true;
        }
    });

    // Handler for when user changes search radius
    $("#dropdown2 > li").on("click", function() {
        let radius = $(this).attr("data-radius").split(" ")[0];
        console.log("Changed radius to " + radius);
        searchAll(startAddr, radius);
    });

}); // end of document ready
