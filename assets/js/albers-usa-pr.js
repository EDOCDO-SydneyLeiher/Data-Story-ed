﻿// A modified d3.geo.albersUsa to include Puerto Rico.
function albersUsaPr() {
    var ε = 1e-6;

    var lower48 = d3.geo.albers();

    // EPSG:3338
    var alaska = d3.geo.conicEqualArea()
        .rotate([154, 0])
        .center([-2, 58.5])
        .parallels([55, 65]);

    // ESRI:102007
    var hawaii = d3.geo.conicEqualArea()
        .rotate([157, 0])
        .center([-3, 19.9])
        .parallels([8, 18]);

    // XXX? You should check that this is a standard PR projection!
    var puertoRico = d3.geo.conicEqualArea()
        .rotate([66, 0])
        .center([0, 18])
        .parallels([8, 18]);

    var point,
        pointStream = { point: function (x, y) { point = [x, y]; } },
        lower48Point,
        alaskaPoint,
        hawaiiPoint,
        puertoRicoPoint;

    function albersUsa(coordinates) {
        var x = coordinates[0], y = coordinates[1];
        point = null;
        (lower48Point(x, y), point)
            || (alaskaPoint(x, y), point)
            || (hawaiiPoint(x, y), point)
            || (puertoRicoPoint(x, y), point);
        return point;
    }

    albersUsa.invert = function (coordinates) {
        var k = lower48.scale(),
            t = lower48.translate(),
            x = (coordinates[0] - t[0]) / k,
            y = (coordinates[1] - t[1]) / k;
        return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
            : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
                : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
                    : lower48).invert(coordinates);
    };

    // A naïve multi-projection stream.
    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    albersUsa.stream = function (stream) {
        var lower48Stream = lower48.stream(stream),
            alaskaStream = alaska.stream(stream),
            hawaiiStream = hawaii.stream(stream),
            puertoRicoStream = puertoRico.stream(stream);
        return {
            point: function (x, y) {
                lower48Stream.point(x, y);
                alaskaStream.point(x, y);
                hawaiiStream.point(x, y);
                puertoRicoStream.point(x, y);
            },
            sphere: function () {
                lower48Stream.sphere();
                alaskaStream.sphere();
                hawaiiStream.sphere();
                puertoRicoStream.sphere();
            },
            lineStart: function () {
                lower48Stream.lineStart();
                alaskaStream.lineStart();
                hawaiiStream.lineStart();
                puertoRicoStream.lineStart();
            },
            lineEnd: function () {
                lower48Stream.lineEnd();
                alaskaStream.lineEnd();
                hawaiiStream.lineEnd();
                puertoRicoStream.lineEnd();
            },
            polygonStart: function () {
                lower48Stream.polygonStart();
                alaskaStream.polygonStart();
                hawaiiStream.polygonStart();
                puertoRicoStream.polygonStart();
            },
            polygonEnd: function () {
                lower48Stream.polygonEnd();
                alaskaStream.polygonEnd();
                hawaiiStream.polygonEnd();
                puertoRicoStream.polygonEnd();
            }
        };
    };

    albersUsa.precision = function (_) {
        if (!arguments.length) return lower48.precision();
        lower48.precision(_);
        alaska.precision(_);
        hawaii.precision(_);
        puertoRico.precision(_);
        return albersUsa;
    };

    albersUsa.scale = function (_) {
        if (!arguments.length) return lower48.scale();
        lower48.scale(_);
        alaska.scale(_ * .35);
        hawaii.scale(_);
        puertoRico.scale(_);
        return albersUsa.translate(lower48.translate());
    };

    albersUsa.translate = function (_) {
        if (!arguments.length) return lower48.translate();
        var k = lower48.scale(), x = +_[0], y = +_[1];

        lower48Point = lower48
            .translate(_)
            .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
            .stream(pointStream).point;

        alaskaPoint = alaska
            .translate([x - .307 * k, y + .201 * k])
            .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
            .stream(pointStream).point;

        hawaiiPoint = hawaii
            .translate([x - .205 * k, y + .212 * k])
            .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
            .stream(pointStream).point;

        puertoRicoPoint = puertoRico
            .translate([x + .350 * k, y + .224 * k])
            .clipExtent([[x + .320 * k, y + .204 * k], [x + .380 * k, y + .234 * k]])
            .stream(pointStream).point;

        return albersUsa;
    };

    return albersUsa.scale(1070);
}