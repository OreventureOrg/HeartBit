import utils from '../../utils';
import { echartSetOption } from './echarts-utils';

const echartsUnresolvedTicketsInit = () => {
  const $unresolvedTickets = document.querySelector('.echart-unresolved-tickets');

  if ($unresolvedTickets) {
    const userOptions = utils.getData($unresolvedTickets, 'options');
    const chart = window.echarts.init($unresolvedTickets);
    const unresolvedTicketsLegend = document.querySelectorAll('[data-unresolved-tickets]');
    const xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data1 = [20, 18, 15, 20, 12, 15, 10];
    const data2 = [30, 20, 20, 25, 20, 15, 10];
    const data3 = [35, 32, 40, 50, 30, 25, 15];
    const data4 = [15, 25, 20, 18, 10, 15, 25];

    const emphasisStyle = {
      itemStyle: {
        shadowColor: utils.rgbaColor(utils.getColor('dark'), 0.3)
      }
    };

    const getDefaultOptions = () => ({
      color: [
        utils.getColor('primary'),
        utils.getColor('info'),
        utils.isDark() === 'dark' ? '#229BD2' : '#73D3FE',
        utils.isDark() === 'dark' ? '#195979' : '#A9E4FF'
      ],
      tooltip: {
        trigger: 'item',
        padding: [7, 10],
        backgroundColor: utils.getGrays()['100'],
        borderColor: utils.getGrays()['300'],
        textStyle: { color: utils.getGrays()['900'] },
        borderWidth: 1,
        transitionDuration: 0,
        axisPointer: {
          type: 'none'
        }
      },
      legend: {
        data: ['Urgent', 'High', 'Medium', 'Low'],
        show: false
      },
      xAxis: {
        data: xAxisData,
        splitLine: { show: false },
        splitArea: { show: false },

        axisLabel: {
          color: utils.getGrays()['600'],
          margin: 8
        },

        axisLine: {
          lineStyle: {
            color: utils.getGrays()['300'],
            type: 'dashed'
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            color: utils.getGrays()['300'],
            type: 'dashed'
          }
        },
        axisLabel: {
          color: utils.getGrays()['600']
        },
        position: 'right'
      },
      series: [
        {
          name: 'Urgent',
          type: 'bar',
          stack: 'one',
          emphasis: emphasisStyle,
          data: data1
        },
        {
          name: 'High',
          type: 'bar',
          stack: 'one',
          emphasis: emphasisStyle,
          data: data2
        },
        {
          name: 'Medium',
          type: 'bar',
          stack: 'one',
          emphasis: emphasisStyle,
          data: data3
        },
        {
          name: 'Low',
          type: 'bar',
          stack: 'one',
          emphasis: emphasisStyle,
          data: data4,
          itemStyle: {
            borderRadius: [2, 2, 0, 0]
          }
        }
      ],

      barWidth: '15px',
      grid: {
        top: '8%',
        bottom: 10,
        left: 0,
        right: 2,
        containLabel: true
      }
    });

    echartSetOption(chart, userOptions, getDefaultOptions);

    unresolvedTicketsLegend.forEach(el => {
      el.addEventListener('change', () => {
        chart.dispatchAction({
          type: 'legendToggleSelect',
          name: utils.getData(el, 'unresolved-tickets')
        });
      });
    });
  }
};

export default echartsUnresolvedTicketsInit;
