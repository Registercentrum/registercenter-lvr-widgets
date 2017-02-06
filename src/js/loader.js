(function () {

    var widget = (function () {

        function createChart() {
            var chart = Ext.create('Ext.chart.Chart', {
                store: Ext.data.StoreManager.lookup('DetailChartStore'),
                // theme: 'LVRTheme',
                hidden: true,
                animate: true,
                shadow: false,
                height: 400,
                columnWidth: 1,
                width: '100%',
                insetPadding: {
                    top: 55,
                    right: 25,
                    left: 25,
                    bottom: 25
                },
                margin: 2,
                style: {
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                },
                legend: {
                    // boxStrokeWidth: 0
                    dock: 'bottom'
                },
                axes: [{
                        type: 'numeric',
                        position: 'left',
                        minimum: 0,
                        grid: true,
                        dashSize: 0,
                        renderer: Ext.util.Format.numberRenderer('0%')
                    },
                    {
                        type: 'category',
                        position: 'bottom',
                        fields: ['unit']
                    }
                ]
            });

            return chart
        }

        function createRatioGaugesContainer(onClick) {
            var ratioGCont = Ext.create('RC.ui.RatioGaugeContainer', {
                columnWidth: 1,
                store: Ext.data.StoreManager.lookup('ratioGaugeStore'),
                onClick: onClick
            });
            return ratioGCont;
        }

        function onGaugeClickFactory(chart) {
            var store = chart.getStore();
            return function loadChartAndShow() {
                console.log('clicking', this.report);
                Repository.Local.Methods.getChartData(this.report.id, function (err, payload) {
                    if (err) {
                        // add notification of failure?
                        return Ext.log(err);
                    }
                    console.log(payload);
                    store.loadData(payload.data);
                    if (chart.hidden)
                        chart.show();

                    // chart.ownerCt.doLayout();
                    // chart.redraw();
                });

            }
        }

        function populateRatioGaugeStore(cb) {
            var store = Ext.data.StoreManager.lookup('ratioGaugeStore');
            store.load({
                params: {},
                callback: function (records, operation, success) {
                    if (success)
                        cb();
                    // Add notification on failure?
                }
            });
        }

        function init() {
            var chart, ratioGauges;

            chart = createChart();
            ratioGauges = createRatioGaugesContainer(onGaugeClickFactory(chart));

            Ext.tip.QuickTipManager.init(true, {
                dismissDelay: 0
            });

            Ext.create('Ext.container.Container', {
                renderTo: 'mainContainer',
                layout: {
                    type: 'column',
                    align: 'center'
                },
                items: [ratioGauges, chart]
            });

            //todo check if store is populated before calling populate..
            populateRatioGaugeStore(function () {
                Ext.fly('mainContainer').unmask();
            });

        }
        return {
            init: init
        }


    }());

    Ext.application({
        name: 'LVR-ratioGauges',
        launch: function () {
            Ext.fly('mainContainer').mask('Laddar data ...');
            widget.init();
        }
    })
}());