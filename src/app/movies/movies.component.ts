import * as d3 from 'd3';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface DATA {
  YEAR: number;
  ingresso: number;
}

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit {
  @ViewChild('chart')
  private chartContainer!: ElementRef;

  private chart: any;

  private margin: any = { top: 20, bottom: 20, left: 30, right: 20};

  private width!: number;
  private height!: number;

  private colors: any;

  private xScale: any;
  private yScale: any;

  private xAxis: any;
  private yAxis: any;

  public dataSourceNameCsv: string = 'AnnualTicketSales';
  public dataChart: [] = [];

  constructor() { }

  ngOnInit(): void {
    d3.csv(`../../assets/data/${this.dataSourceNameCsv}.csv`).then(data => {
      // console.log(data)
      this.createChart(data)
      this.updateChart()
    })
  }

  createChart(data: any) {

    this.dataChart = data.map((item: any) =>  ({
      ingresso: Number(item['AVERAGE TICKET PRICE'].replace('$', '')),
      YEAR: item.YEAR
    }))

    let element = this.chartContainer.nativeElement;

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    let xDomain = this.dataChart.map((d: any) => d.YEAR);
    let yDomain: [number, number] = [
      d3.min(this.dataChart.map((item: any) => item.ingresso)) as number,
      d3.max(this.dataChart.map((item: any) => item.ingresso)) as number
    ];
    // let yDomain: [number, number] = [
    //   d3.min(data, ({ YEAR }) => YEAR  ) as number,
    //   d3.max(data, ({ YEAR }) => YEAR ) as number
    // ];

    // console.log(yDomain)

    //  create scales
    this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // console.log(this.yScale(dataChart))

    // bar colors
    this.colors = d3.scaleLinear().domain([0, data.length]).range(<any[]>['red', 'blue']);

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale));

    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));
  }

  updateChart() {

    this.xScale.domain(this.dataChart.map((d: any) => d.YEAR)); // TIPAR
    this.yScale.domain([
      d3.min(this.dataChart.map((item: any) => item.ingresso)),
      d3.max(this.dataChart.map((item: any) => item.ingresso))
    ]); // TIPAR
    this.colors.domain([0, this.dataChart.length]);

    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    let update = this.chart.selectAll('.bar')
      .data(this.dataChart);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', (d: any) => this.xScale(d.YEAR))
      .attr('y', (d: any) => this.yScale(d.ingresso))
      .attr('width', (d: any) => this.xScale.bandwidth())
      .attr('height', (d: any, i: any) => this.height - this.yScale(d.ingresso))
      .style('fill', (d: any, i: any) => this.colors(i));

   // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => this.xScale(d.YEAR))
      .attr('y', (d: any) => this.yScale(4.35))
      .attr('width', this.xScale.bandwidth())
      .attr('height', 0)
      .style('fill', (d: any, i: any) => this.colors(i))
      .transition()
      .delay((d: any, i: any) => i * 60)
      .attr('y', (d: any) => this.yScale(d.ingresso))
      .attr('height', (d: any, i: any) => this.height - this.yScale(d.ingresso));
  }

}
