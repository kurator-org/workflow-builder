var express = require('express');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var app = express();

app.use(express.static('public'));

app.post('/build', function (req, res) {
    var workflowTpl = fs.readFileSync(path.resolve('templates/actors/workflow.yaml'), 'utf8');
    var template = _.template(workflowTpl);

    var json = JSON.parse(fs.readFileSync(path.resolve('templates/example.json'), 'utf8'));
    var result = template({workflow: json.workflow});

    json.workflow.actors.forEach(function (actor) {
        var tplFile = actor.template + '.yaml';
        var actorTpl = fs.readFileSync(path.resolve('templates/actors/', tplFile), 'utf8');
        var template = _.template(actorTpl);

        result += template({ actor: actor });
    });

    res.setHeader('Content-disposition', 'attachment; filename=workflow.yaml');
    res.send(result);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
