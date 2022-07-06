import {BlindIndex, CipherSweet, EncryptedField, StringProvider} from "ciphersweet-js";



const engine = new CipherSweet(new StringProvider('7ad2639bee5a8bcf09ded6d1dfc082dce1b511f54e9233919681a3ad894a1762'));

/** @var CipherSweet engine */
const ssn = (new EncryptedField(engine, 'contacts', 'ssn'))
    // Add a blind index for the "last 4 of SSN":
    // .addBlindIndex(
    //     new BlindIndex(
    //         // Name (used in key splitting):
    //         'contact_ssn_last_four',
    //         // List of Transforms:
    //         [new LastFourDigits()],
    //         // Bloom filter size (bits)
    //         16
    //     )
    // )
    // Add a blind index for the full SSN:
    .addBlindIndex(
        new BlindIndex(
            'ssn',
            [],
            32
        )
    );

// Some example parameters:
const contactInfo = {
    'name': 'John Smith',
    'ssn': '123-45-6789',
    'email': 'foo@example.com'
};


ssn.prepareForStorage(contactInfo['ssn']).then(([ciphertext, indexes]) => {
    console.log(ciphertext);
    /* nacl:jIRj08YiifK86YlMBfulWXbatpowNYf4_vgjultNT1Tnx2XH9ecs1TqD59MPs67Dp3ui */
    console.log(indexes);
    // print object values only

    console.log();
    /* { contact_ssn_last_four: '2acb', contact_ssn: '311314c1' } */
});