# TURN Server Setup Guide

## Understanding STUN vs TURN

WebRTC tries to establish peer-to-peer connections using the following methods, in order:
1. Direct connection
2. STUN - helps peers discover their public IP address and port
3. TURN - relays traffic between peers when direct/STUN connections fail

### STUN (Session Traversal Utilities for NAT)
- Lightweight protocol that helps peers behind NAT discover their public IP address
- Low bandwidth usage as it only helps with connection discovery
- No relay costs, but doesn't work when peers are behind strict firewalls

### TURN (Traversal Using Relays around NAT)
- Relays all traffic through the server when direct/STUN connections fail
- Higher bandwidth usage and server costs
- Required for peers behind symmetric NATs or strict firewalls
- More reliable but should only be used as a fallback

## Quick Install

The installer script automates the complete TURN server setup process:

```bash
# Download the installer
wget https://raw.githubusercontent.com/steveseguin/vdo.ninja/develop/turnserver_install.sh.sample
mv turnserver_install.sh.sample turnserver_install.sh
chmod +x turnserver_install.sh

# Run the installer
sudo ./turnserver_install.sh
```

The installer will:
1. Install coturn and dependencies
2. Configure system limits for high connection loads
3. Set up base TURN/STUN configuration
4. Optionally configure SSL/TLS support
5. Create systemd service for auto-start
6. Configure proper permissions

## Basic Configuration Explained

The basic configuration (`turnserver_basic.conf`) provides a minimal but functional TURN server:

```conf
listening-port=3478        # Standard STUN/TURN port
fingerprint               # Required for WebRTC
lt-cred-mech             # Long-term credential mechanism
user=username:password    # Authentication credentials
stale-nonce=600          # Nonce timeout in seconds
realm=turn.example.com   # Your server's domain
server-name=turn.example.com
no-multicast-peers       # Security measure
dh2066                   # Strong DH params
no-stdout-log           # Disable stdout logging
```

## SSL/TLS Support (Optional)

The installer can configure SSL/TLS support which:
- Enables TURNS (TURN over TLS) on port 443
- Automatically obtains and renews SSL certificates via certbot
- Configures automatic certificate reload without server restart

## Testing Your Server

Test your TURN server at: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

Example configurations to test:
- STUN/TURN: `turn:your-domain:3478`
- TURNS (if SSL enabled): `turns:your-domain:443`

## Firewall Configuration

Required ports:
- 3478 TCP/UDP (STUN/TURN)
- 443 TCP/UDP (TURNS, if enabled)
- 49152:65535 TCP/UDP (Media relay ports)

## Advanced Usage

### Reloading SSL Certificates
```bash
sudo systemctl --signal=SIGUSR2 kill coturn
```

### Checking Server Status
```bash
sudo systemctl status coturn
```

### Updating Configuration
1. Edit `/etc/turnserver.conf`
2. Restart service: `sudo systemctl restart coturn`

## Common Issues

1. **Permission denied errors**
   - The installer handles this by setting proper capabilities
   - Manual fix: `sudo setcap cap_net_bind_service=+ep /usr/bin/turnserver`

2. **SSL certificate errors (701)**
   - Verify certificate permissions
   - Check certificate paths in configuration
   - Ensure certificates are readable by turnserver user

## Production Considerations

1. **System Limits**
   The installer configures higher system limits for production use:
   - File descriptors: 65535
   - System max files: 65535

2. **Monitoring**
   - Monitor bandwidth usage
   - Watch for high CPU/memory usage
   - Track active connections

3. **Security**
   - Regularly update credentials
   - Monitor for abuse
   - Keep coturn and SSL certificates up to date

## Support

For issues or questions:
- Create an issue on the VDO.Ninja GitHub repository
- Join the VDO.Ninja Discord community

## References
- [Coturn Documentation](https://github.com/coturn/coturn/wiki/turnserver)
- [WebRTC Samples](https://webrtc.github.io/samples/)
- [VDO.Ninja GitHub](https://github.com/steveseguin/vdo.ninja)