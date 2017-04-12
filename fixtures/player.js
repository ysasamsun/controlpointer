module.exports.player = {
    id: '21b35uifh007',
    firstName: 'Nina',
    lastName: 'Armstrong',
    affiliation: 'red',
    dob: '1971-06-11T07:26:04.837Z',
    class: 'Captain',
    loadout: [ 'Assault Rifle', 'Pistol', 'Bandages' ],
    abilities: [ 'claim', 'self-heal', 'capmantle', 'healable', 'register' ],
    picture: 'placekitten.com/150/150',
    scans:
    [ { caption: 'claim',
	data: 'http://127.0.0.1:5000/null?sourceid=21b35uifh007',
	image: '/home/chris/scripts/controlpointer/client_app/images/qr/kbibnkeb.png',
	selfSource: false },
      { caption: 'self-heal',
	data: 'http://127.0.0.1:5000/heal?sourceid=21b35uifh007',
	image: '/home/chris/scripts/controlpointer/client_app/images/qr/kjimecn.png',
	selfSource: true },
      { caption: 'capmantle',
	data: 'http://127.0.0.1:5000/null?sourceid=21b35uifh007',
	image: '/home/chris/scripts/controlpointer/client_app/images/qr/lacfgai.png',
	selfSource: false },
      { caption: 'healable',
	data: 'http://127.0.0.1:5000/heal?sourceid=21b35uifh007',
	image: '/home/chris/scripts/controlpointer/client_app/images/qr/cnfcc.png',
	selfSource: true },
      { caption: 'register',
	data: 'http://127.0.0.1:5000/become?sourceid=21b35uifh007&affiliation=red&class=Captain',
	image: '/home/chris/scripts/controlpointer/client_app/images/qr/cfkgebli.png',
	selfSource: true } ]
}