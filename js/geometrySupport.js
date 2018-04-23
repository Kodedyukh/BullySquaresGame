linesSeenFromPoint = function(center, radius, point) {
	var centerPointLine = new Phaser.Line(point.x, point.y, center.x, center.y),
		normalAngle = centerPointLine.normalAngle;

	var positiveLine = new Phaser.Line();
	positiveLine.fromAngle(center.x, center.y, normalAngle, radius);

	var reverseNormalAngle = normalAngle - Math.PI;

	var negativeLine = new Phaser.Line();
	negativeLine.fromAngle(center.x, center.y, reverseNormalAngle, radius);

	return [positiveLine, negativeLine];
};

checkSeenBehindCircle = function(center, radius, point, objectPosition) {
	var objectPointLine = new Phaser.Line(point.x, point.y, objectPosition.x, objectPosition.y);

	var radiusLines = linesSeenFromPoint(center, radius, point);

	return (Phaser.Line.intersects(objectPointLine, radiusLines[0]) || Phaser.Line.intersects(objectPointLine, radiusLines[1]));
};