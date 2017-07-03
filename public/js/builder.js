var actors = [];

var source, target;
var connections = [];

var addActor = function (actor, left, top) {
    // Render actor dom elements
    var template = _.template($('#actor-template').html());
    var $el = $(template({actor: actor}));

    // Position actor element
    $('#container').append($el);
    $el.css({left: left, top: top});


    // Add actor object
    actor.id = actors.length;
    actors.push(actor);

    // Attach actor object to dom
    $el.data({
        actor: actor,
        connections: []
    });

    // Event handler for dragging
    $el.on('mousedown', dragHandler);

    if (actor.inputs) {
        actor.inputs.forEach(function (input) {
            var $input = $('#'+input.id);

            $input.data({
                actor: actor,
                endpoint: input
            })

            $input.on('mousedown', endpointHandler);
            $input.on('mouseup', endpointMouseup);
        });
    }

    if (actor.outputs) {
        actor.outputs.forEach(function (output) {
            var $output = $('#'+output.id);

            $output.data({
                actor: actor,
                endpoint: output
            });

            $output.on('mousedown', endpointHandler);
            $output.on('mouseup', endpointMouseup);
        });
    }
}

var dragHandler = function(e) {

    // mouse coords relative to page
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    // element position relative to page
    var xElem = $(this).offset().left;
    var yElem = $(this).offset().top;

    // element position relative to container
    var xPos = $(this).position().left;
    var yPos = $(this).position().top;

    // mouse coords relative to element
    var xOffset = mouseX - xElem;
    var yOffset = mouseY - yElem;

    var elem = $(this);

    var startDrag = function (e) {
        var x = e.pageX;
        var y = e.pageY;

        // Distance dragged
        var deltaX = x - mouseX;
        var deltaY = y - mouseY;

        elem.css({top: yPos + deltaY, left: xPos + deltaX});

        // TODO: a hack for now, look up connections by actor instead of all
        connections.forEach(function (connection) {
            var source = connection.source;
            var target = connection.target;

            // Endpoint positions
            var x1 = source.offset().left;
            var y1 = source.offset().top + (source.outerHeight()/2);

            var x2 = target.offset().left + target.outerWidth();
            var y2 = target.offset().top + (target.outerHeight()/2);

            connection.curve.update(x1, y1, x2, y2);
        });

    };

    var endDrag = function (e) {
        $('html').off('mousemove', startDrag);
        $('html').off('mouseup', endDrag);
    };

    $('html').on('mouseup', endDrag);
    $('html').on('mousemove', startDrag);
};

var endpointHandler = function (e) {
   if ($(this).hasClass('input')) {

       // TODO: drag to remove connection

   } else if ($(this).hasClass('output')) {
       source = $(this);

       // Endpoint position
       var x1 = source.offset().left;
       var y1 = source.offset().top + (source.outerHeight()/2);

       var conn = curve(x1, y1, e.pageX, e.pageY);

       var startCurve = function (e) {
           //console.log([e.pageX, e.pageY, x1, y1]);
           conn.update(x1, y1, e.pageX, e.pageY);
       };

       var endCurve = function (e) {
           $('html').off('mousemove', startCurve);
           $('html').off('mouseup', endCurve);

           if (!target) {
               conn.remove();
           } else {

               // Endpoint position
               var x2 = target.offset().left + target.outerWidth();
               var y2 = target.offset().top + (target.outerHeight()/2);

               conn.update(x1, y1, x2, y2);

               connections.push({
                   source: source,
                   target: target,
                   curve: conn
               });
           }

           source = target = null;
       };

       $('html').on('mouseup', endCurve);
       $('html').on('mousemove', startCurve);
   }

   return false;
};

var endpointMouseup = function (e) {
    // set source
    target = $(this);
};


// Helper function for drawing curves
var curve = function(x1, y1, x2, y2) {
    // Distance
    var d = (x2-x1)/2;

    // Control points
    var cp1 = x1+d;
    var cp2 = x2-d;

    var path = [["M", x1, y1], ["C", cp1, y1, cp2, y2, x2, y2]];
    var c = paper.path(path);

    c.update = function (x1, y1, x2, y2) {
        d = (x2-x1)/2;

        path[0][1] = x1;
        path[0][2] = y1;

        path[1][1] = x1+d;
        path[1][2] = y1;

        path[1][3] = x2-d;
        path[1][4] = y2;

        path[1][5] = x2;
        path[1][6] = y2;

        this.attr({path: path});
    }

    return c;
}