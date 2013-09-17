stocktil.es v1.5
===================
Simple user-friendly stock monitor that updates real time data for entered symbols

Demo
====
[http://stocktil.es/demo/](http://stocktil.es/demo/ "stocktil.es")


Installation
============
Add the file **quotes.php** and the **js folder** in same directory level as your page. Then include the javascript and jquery lines to your `<head>` area of your page.
* `<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>`
* `<script type="text/javascript" src="js/stocktile.js"></script>`
	
Simply place `<div>` in desired location in the `<body>` of your page.
* `<div id='quoteContent'></div>`


Usage
=====
* Enter stock symbol either one at a time (goog) or multiple symbols using commas (goog,aapl,msft)
* Remove a symbol by clicking the minus sign (-)
* Clear all tiles by pressing the clear all button

Release Cycle
=============
- [x] alpha - base code
- [x] v1    - css styling
- [x] v1.5  - input to take comma delimited list
- [ ] v2    - angularjs
- [ ] v3    - html5 offline storage
- [ ] v4    - sort by value, price, change etc.
- [ ] v5    - widigitize


Contributors
============
[Ashton Paul](https://github.com/ashtonp "ashtonp")

[Hillius Ettinoffe](https://github.com/hilliuse "hilliuse")
