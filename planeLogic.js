var currentPlane = 0;
var maxPlanes = 0;
var shuffledPlanes;

// Constants
var PHENOMENON_CLASS = "phenom-plane";
var PLANE_LABEL_CLASS = "plane-label";

function knuthShuffle(arr) {
    var rand, temp, i;

    for (i = arr.length - 1; i > 0; i -= 1) {
        rand = Math.floor((i + 1) * Math.random());//get random between zero and i (inclusive)
        temp = arr[rand];
        arr[rand] = arr[i]; //swap i (last element) with random element.
        arr[i] = temp;
    }
    return arr;
}

function showPlane(arr, id) {
    $('#planeImage').attr('src', arr[id].image_uris.large);
    $('#planeImage').attr('alt', arr[id].name);
    $('#planeImage').css({
        'transform': 'rotate(90deg)'
    });
}

function setupGameOptions() {
    $('#selectAll').show();
    $('#clearAll').show();

    currentSetName = "";

    // Create the list of checkboxes for the planes
    allPlanes.data.forEach(plane => {
        if (plane.set_name != currentSetName) {
            if (currentSetName != "") {
                $('#accordion').append('</div>')
            }

            $('#accordion').append('<h3>' + plane.set_name + '</h3><div id="' + plane.set + '">')
            currentSetName = plane.set_name
            // create the All checkbox within this specific group.
            $('#' + plane.set).append('<div class="form-check"><input class="form-check-input allCheck" type="checkbox" value="" id="' + plane.set + 'AllCheck"><label class="form-check-label" for="' + plane.set + 'allCheck">All</label></div>')
        }

        var isPhenom = ""
        if (plane.type_line == "Phenomenon") {
            isPhenom = PHENOMENON_CLASS;
        }
        $('#' + plane.set).append('<div class="form-check"><input class="' + isPhenom + ' plane-check form-check-input" type="checkbox" value="" data-name="' + plane.name + '" id="' + plane.id + '"><label class="plane-label form-check-label" for="' + plane.id + '">' + plane.name + '</label></div>')
    });
    $('#accordion').append('</div>')
    $('#accordion').accordion({
        collapsible: true,
        heightStyle: "content",
        active: false
    });
    $("#accordion").accordion("option", "active", false);

    // setup a change handler for the All checkboxes for each group
    $(".allCheck").change(function () {
        var checkSet = this.id.slice(0, -8);
        if (this.checked) {
            $('#' + checkSet + ' .plane-check').prop('checked', true);
        } else {
            $('#' + checkSet + ' .plane-check').prop('checked', false);
        }
        // uncheck phenoms
        if ($('#ignorePhenomenon').prop('checked') == true) {
            $('#' + checkSet + ' .' + PHENOMENON_CLASS).prop('checked', false)
        }
    });

    // create the hover tooltip for all the plane texts (plane-label class)
    $('#gameSetup').uitooltip({
        items: '.plane-label',
        track: true,
        content: function () {
            var element = $(this);
            var plane = allPlanes.data.find(x => x.id === element.attr('for'));
            if (plane) {
                return "<div class='card bg-light ' >" +
                    //"<img class='card-img-top' src='" + plane.image_uris.normal + "' style='transform: rotate(90deg); width:50%; height:50%'>" +
                    "<div class='card-header'>" + plane.name + "</div>" +
                    "<div class='card-body'>" +
                    "<h6 class='card-subtitle text-muted'>" + plane.type_line + "</h5>" +
                    "<p class='card-text'>" + plane.oracle_text + "</p>" +
                    "</div></div>";
            } else {
                return "plane not found";
            }
        }
    });

    $("#accordion .ui-accordion-content").show();

}

function getSelectedCheckboxes() {
    var arrayOfCheckboxes = [];
    var planeCheckBoxes = $('.plane-check');
    planeCheckBoxes.each(function (idx, cb) {
        var $chxbx = $(cb);
        if ($chxbx.prop('checked') == true) {
            arrayOfCheckboxes.push($chxbx.prop('id'));
        }
    })

    return arrayOfCheckboxes;
}

function initialSetup() {
    currentPlane = 0;
    maxPlanes = 0;

    setupGameOptions()
    $('.game-setup').show()
    $('.game-play').hide()

    $('#selectAllBtn').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            if ($chxbx.hasClass(PHENOMENON_CLASS) && $('#ignorePhenomenon').prop('checked') == true) {
                $chxbx.prop('checked', false)
            } else {
                $chxbx.prop('checked', true)
            }
        })
        $('.allCheck').prop('checked', true);
    })

    $('#clearAllBtn').click(function () {
        var planeCheckBoxes = $('.plane-check');
        planeCheckBoxes.each(function (idx, cb) {
            var $chxbx = $(cb);
            $chxbx.prop('checked', false)
        })
        $('.allCheck').prop('checked', false);
    })

    $('#ignorePhenomenon').change(function () {
        if (this.checked) {
            $('.' + PHENOMENON_CLASS).prop('checked', false);
            $('.' + PHENOMENON_CLASS).prop('disabled', true);
        } else {
            $('.' + PHENOMENON_CLASS).prop('disabled', false);
        }
    })

    $('#playBtn').click(function () {
        // check if any were checked
        var selectedCheckboxes = getSelectedCheckboxes();
        if (selectedCheckboxes.length < 2) {
            alert('Select at least 2 planes before starting.')
            return
        }
        // get/create array of selected planes.
        var selectedPlanes = allPlanes.data.filter(function (el) {
            return selectedCheckboxes.includes(el.id)
        })

        if (selectedPlanes.length < 2) {
            alert('Select at least 2 planes before starting.')
            return
        }

        // shuffle the planes
        shuffledPlanes = knuthShuffle(selectedPlanes)
        maxPlanes = selectedPlanes.length

        // setup new game
        currentPlane = 0

        // show first plane
        showPlane(shuffledPlanes, currentPlane)

        // start with the Previous button disabled since we're on the first plane.
        $('#prevBtn').prop("disabled",true);
        
        // show game area and hide setup area
        $('.game-setup').hide()
        $('.game-play').show()
    })

    $('#endGameBtn').click(function () {
        // hide game area and show setup area
        $('.game-setup').show()
        $('.game-play').hide()

        currentPlane = 0;
    });

    $('#prevBtn').click(function () {
        if (currentPlane > 0) {
            currentPlane--
            showPlane(shuffledPlanes, currentPlane)
        }

        $('#nextBtn').show()

        if (currentPlane == 0) {
            $('#prevBtn').prop("disabled",true);
        } else {
            $('#prevBtn').prop("disabled",false);
        }
        $('#nextBtn').prop("disabled",false);
    })

    $('#nextBtn').click(function () {
        if (currentPlane < maxPlanes - 1) {
            currentPlane++
            showPlane(shuffledPlanes, currentPlane)
        }

        $('#prevBtn').show()

        if (currentPlane == maxPlanes - 1) {
            $('#nextBtn').prop("disabled",true);
        } else {
            $('#nextBtn').prop("disabled",false);
        }
        $('#prevBtn').prop("disabled",false);
    })

    $('#moveToEndBtn').click(function () {
        shuffledPlanes.push(shuffledPlanes.splice(currentPlane, 1)[0])
        showPlane(shuffledPlanes, currentPlane)
    })
}