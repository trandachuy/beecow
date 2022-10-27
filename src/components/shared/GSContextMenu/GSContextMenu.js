import React from 'react';
import ReactDOM from 'react-dom';
import './GSContextMenu.sass';

class GSContextMenu extends React.Component {
  
  state = {
    visible: false
  };

  componentDidMount() {
      document.addEventListener('contextmenu', this.handleRightClickOutside);
      document.addEventListener('click', this.handleClickOutside);
      document.addEventListener('scroll', this.handleScroll);
  };

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this.handleRightClickOutside);
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('scroll', this.handleScroll);
  }

  handleClickOutside = (e) => {
    const div = ReactDOM.findDOMNode(this.div);
    const context = ReactDOM.findDOMNode(this.root);
    const isInRow = (!div.contains(e.target) || div.contains(e.target));
    const isInContext = (context)? !context.contains(e.target): false;

    if (isInRow && isInContext) {
      this.setState({
        visible: false
      });
    } 
  }
  
  handleRightClickOutside = (e) => {
    const div = ReactDOM.findDOMNode(this.div);
    const isInRow = !div.contains(e.target);
 
    if (isInRow) {
      this.setState({
        visible: false
      });
    }
  }

  handleContextMenu = (event) => {
      event.preventDefault();
      this.setState({ visible: true });
      const root = ReactDOM.findDOMNode(this.root);
      
      const clickX = event.clientX;
      const clickY = event.clientY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const rootW = root? root.offsetWidth: 0;
      const rootH = root? root.offsetHeight: 0;
      
      const right = (screenW - clickX) > rootW;
      const left = !right;
      const top = (screenH - clickY) > rootH;
      const bottom = !top;
      
      if (right && root) {
        root.style.left = `${clickX + 5}px`;
      }
      
      if (left && root) {
        root.style.left = `${clickX - rootW - 5}px`;
      }
      
      if (top && root) {
        root.style.top = `${clickY + 5}px`;
      }
      
      if (bottom && root) {
        root.style.top = `${clickY - rootH - 5}px`;
      }
  };

  handleClick = (event) => {
    const { visible } = this.state;
    const wasOutside = !(event.target.contains === this.root);
    
    if (wasOutside && visible) this.setState({ visible: false });
  };

  handleScroll = (e) => {
      const { visible } = this.state;
      
      if (visible) this.setState({ visible: false });
  };

  render() {
    const { visible } = this.state;
    return <div ref={(node) => this.div = node} onContextMenu={this.handleContextMenu}>
          {this.props.children}
          {(visible || null) && <div ref={ref => {this.root = ref}} className="contextMenu">
              {/* <div className="contextMenu--option">Share this</div>
              <div className="contextMenu--option">New window</div>
              <div className="contextMenu--option">Visit official site</div>
              <div className="contextMenu--option contextMenu--option__disabled">View full version</div>
              <div className="contextMenu--option">Settings</div>
              <div className="contextMenu--separator" />
              <div className="contextMenu--option">About this app</div> */}
              { 
                this.props.items && this.props.items.length > 0 &&
                this.props.items.map((item) => {
                  const disabledClass = item.disabled? "contextMenu--option__disabled":"";
                  return <div key={item.key} onClick={item.onClick} className={`contextMenu${(item.type && item.type==="separator")? "--separator":"--option"} ${disabledClass}`} {...item}>{item.label}</div>
                })
              }
            </div>}
          </div>
  };
}


GSContextMenu.propTypes = {
  
};

export default GSContextMenu;