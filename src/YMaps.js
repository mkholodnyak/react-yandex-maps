import React from 'react';
import PropTypes from 'prop-types';

import YandexMapsApi from './util/api';

const { node, bool, shape, string, oneOf, object, func, oneOfType } = PropTypes;

/**
 * {@link https://tech.yandex.com/maps/doc/jsapi/2.1/versions/concepts/index-docpage/}
 * @type {RegExp}
 */
const CORRECT_API_VERSION_RE = /^2\.1.*?/;

export class YMaps extends React.Component {
  static propTypes = {
    children: oneOfType([node, func]),
    onApiAvaliable: func,

    enterprise: bool,
    version: function(props, propName, componentName) {
      if (!CORRECT_API_VERSION_RE.test(props[propName])) {
        return new Error(
          `Invalid version supplied to '${componentName}'. Validation failed.`
        );
      }
    },

    query: shape({
      lang: string,
      apikey: string,
      coordorder: oneOf(['latlong', 'longlat']),
      load: string,
      mode: oneOf(['debug', 'release']),
      csp: bool,
      ns: string,
    }),
  };

  static defaultProps = {
    enterprise: false,
    onApiAvaliable: Function.prototype,
    version: '2.1',
  };

  static childContextTypes = {
    ymaps: object,
  };

  state = { ymaps: null };

  _mounted = true;

  getChildContext() {
    return { ymaps: this.state.ymaps };
  }

  componentDidMount() {
    const { query, version, enterprise, onApiAvaliable } = this.props;

    YandexMapsApi.get(query, version, enterprise).then(ymaps => {
      window.ymaps = ymaps;

      onApiAvaliable(ymaps);
      this._mounted && this.setState({ ymaps });
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    const { children } = this.props;
    const { ymaps } = this.state;

    return typeof children === 'function'
      ? children(ymaps)
      : children ? React.Children.only(children) : null;
  }
}
