import * as React from 'react';
import moment from 'moment';
import Select from '../select';
import { Button as RadioButton, Group, RadioChangeEvent } from '../radio';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { CalendarMode } from './index';
import Button from '../button';

const Option = Select.Option;

export interface HeaderProps {
  prefixCls?: string;
  locale?: any;
  fullscreen?: boolean;
  yearSelectOffset?: number;
  yearSelectTotal?: number;
  type?: string;
  onValueChange?: (value: moment.Moment) => void;
  onTypeChange?: (type: string) => void;
  value: any;
  validRange?: [moment.Moment, moment.Moment];
  showPreviousNextButtons?: boolean;
  showTodayButton?: boolean;
}

export default class Header extends React.Component<HeaderProps, any> {
  static defaultProps = {
    yearSelectOffset: 10,
    yearSelectTotal: 20,
  };

  private calenderHeaderNode: HTMLDivElement;

  getYearSelectElement(prefixCls: string, year: number) {
    const { yearSelectOffset, yearSelectTotal, locale, fullscreen, validRange } = this.props;
    let start = year - (yearSelectOffset as number);
    let end = start + (yearSelectTotal as number);
    if (validRange) {
      start = validRange[0].get('year');
      end = validRange[1].get('year') + 1;
    }
    const suffix = locale.year === '年' ? '年' : '';
    const options: React.ReactElement<any>[] = [];
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{index + suffix}</Option>);
    }
    return (
      <Select
        size={fullscreen ? 'default' : 'small'}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-year-select`}
        onChange={this.onYearChange}
        value={String(year)}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }

  getMonthsLocale(value: moment.Moment) {
    const current = value.clone();
    const localeData = value.localeData();
    const months: any[] = [];
    for (let i = 0; i < 12; i++) {
      current.month(i);
      months.push(localeData.monthsShort(current));
    }
    return months;
  }

  getMonthSelectElement(prefixCls: string, month: number, months: number[]) {
    const { fullscreen, validRange, value } = this.props;
    const options: React.ReactElement<any>[] = [];
    let start = 0;
    let end = 12;
    if (validRange) {
      const [rangeStart, rangeEnd] = validRange;
      const currentYear = value.get('year');
      if (rangeEnd.get('year') === currentYear) {
        end = rangeEnd.get('month') + 1;
      }
      if (rangeStart.get('year') === currentYear) {
        start = rangeStart.get('month');
      }
    }
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{months[index]}</Option>);
    }
    return (
      <Select
        size={fullscreen ? 'default' : 'small'}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-month-select`}
        value={String(month)}
        onChange={this.onMonthChange}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }

  onYearChange = (year: string) => {
    const { value, validRange } = this.props;
    const newValue = value.clone();
    newValue.year(parseInt(year, 10));
    // switch the month so that it remains within range when year changes
    if (validRange) {
      const [start, end] = validRange;
      const newYear = newValue.get('year');
      const newMonth = newValue.get('month');
      if (newYear === end.get('year') && newMonth > end.get('month')) {
        newValue.month(end.get('month'));
      }
      if (newYear === start.get('year') && newMonth < start.get('month')) {
        newValue.month(start.get('month'));
      }
    }

    const onValueChange = this.props.onValueChange;
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  onMonthChange = (month: string) => {
    const newValue = this.props.value.clone();
    newValue.month(parseInt(month, 10));
    const onValueChange = this.props.onValueChange;
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  onTypeChange = (e: RadioChangeEvent) => {
    const onTypeChange = this.props.onTypeChange;
    if (onTypeChange) {
      onTypeChange(e.target.value);
    }
  };

  onTodayClicked = () => {
    const { onValueChange } = this.props;
    if (onValueChange) {
      const today = moment();
      onValueChange(today);
    }
  };

  onPreviousClicked = () => {
    this.handlePreviousOrNextClicked('previous');
  };

  onNextClicked = () => {
    this.handlePreviousOrNextClicked('next');
  };

  handlePreviousOrNextClicked = (direction: 'previous' | 'next') => {
    const { onValueChange, type } = this.props;
    const mode = type as CalendarMode;
    const newValue = this.props.value.clone() as moment.Moment;
    const momentUnit = mode === 'month' ? 'month' : 'year';
    if (direction === 'previous') {
      newValue.subtract(1, momentUnit);
    } else {
      newValue.add(1, momentUnit);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  getCalenderHeaderNode = (node: HTMLDivElement) => {
    this.calenderHeaderNode = node;
  };

  getCalendarNavigationButtonElement = (prefixCls: string, size: 'default' | 'small') => {
    return (
      <Button.Group size={size} className={`${prefixCls}-navigation`}>
        <Button
          icon="left"
          onClick={this.onPreviousClicked}
          className={`${prefixCls}-navigation-previous`}
        />
        <Button
          icon="right"
          onClick={this.onNextClicked}
          className={`${prefixCls}-navigation-next`}
        />
      </Button.Group>
    );
  };

  getTodayButtonElement = (prefixCls: string, locale: any, size: 'default' | 'small') => {
    return (
      <Button size={size} onClick={this.onTodayClicked} className={`${prefixCls}-today-button`}>
        {locale.today}
      </Button>
    );
  };

  renderHeader = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { prefixCls: customizePrefixCls, type, value, locale, fullscreen, showPreviousNextButtons, showTodayButton } = this.props;
    const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
    const size = fullscreen ? 'default' : 'small';
    const yearSelect = this.getYearSelectElement(prefixCls, value.year());
    const monthSelect =
      type === 'month'
        ? this.getMonthSelectElement(prefixCls, value.month(), this.getMonthsLocale(value))
        : null;
    const navigationButtons =
      showPreviousNextButtons === true
        ? this.getCalendarNavigationButtonElement(prefixCls, size)
        : null;
    const todayButton =
      showTodayButton === true ? this.getTodayButtonElement(prefixCls, locale, size) : null;
    const typeSwitch = (
      <Group onChange={this.onTypeChange} value={type} size={size}>
        <RadioButton value="month">{locale.month}</RadioButton>
        <RadioButton value="year">{locale.year}</RadioButton>
      </Group>
    );

    return (
      <div className={`${prefixCls}-header`} ref={this.getCalenderHeaderNode}>
        <div className={fullscreen ? `${prefixCls}-header-left-fullscreen` : `${prefixCls}-header-left`}>
          {navigationButtons}
          {todayButton}
        </div>
        <div className={fullscreen ? `${prefixCls}-header-right-fullscreen` : `${prefixCls}-header-right`}>
          {yearSelect}
          {monthSelect}
          {typeSwitch}
        </div>
      </div>
    );
  };

  render() {
    return <ConfigConsumer>{this.renderHeader}</ConfigConsumer>;
  }
}
